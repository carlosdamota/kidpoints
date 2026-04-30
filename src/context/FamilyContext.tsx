import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, addDoc, deleteDoc, writeBatch, deleteField, orderBy, limit, setDoc } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import confetti from 'canvas-confetti';

import { auth, db, logout } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { AppState, ChildProfile, FamilyDoc, Task, Reward, HistoryEntry } from '../types';
import { INITIAL_STATE } from '../constants';
import { droidSounds } from '../lib/sounds';
import { migrateFamilyToSubcollections } from '../lib/migrate-family';

interface FamilyData extends AppState {}

interface CelebrationState {
  show: boolean;
  title: string;
  subtitle: string;
  type?: 'success' | 'penalty' | 'warning';
}

interface FamilyContextType {
  user: User | null;
  authReady: boolean;
  familyId: string | null;
  familyConfig: FamilyDoc | null;
  state: AppState | null;
  childrenList: ChildProfile[];
  activeChildTasks: Task[];
  activeChildRewards: Reward[];
  activeChildHistory: HistoryEntry[];
  isLoadingHistory: boolean;
  loadHistory: (childId: string) => Promise<void>;
  activeChildId: string | null;
  activeChild: ChildProfile | null;
  needsOnboarding: boolean;
  pointsToday: number;
  redemptionsToday: number;
  nextReward: any;
  weeklyData: any[];
  showCelebration: CelebrationState;
  currentDate: string;
  updateState: (updates: Partial<FamilyData>) => Promise<void>;
  updateChildState: (childId: string, updates: Partial<ChildProfile>) => Promise<void>;
  deleteFamily: () => Promise<void>;
  handleOnboardingComplete: (data: Pick<ChildProfile, 'name' | 'theme' | 'tasks' | 'rewards'>) => Promise<void>;
  handleCompleteTask: (taskId: string) => void;
  handleRedeemReward: (rewardId: string) => void;
  triggerCelebration: (title: string, subtitle: string, type?: 'success' | 'penalty' | 'warning') => void;
  setActiveChildId: (id: string) => void;
  addChild: (data: Pick<ChildProfile, 'name' | 'theme' | 'tasks' | 'rewards'>) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;
  addTask: (childId: string, task: Task) => Promise<void>;
  updateTask: (childId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (childId: string, taskId: string) => Promise<void>;
  addReward: (childId: string, reward: Reward) => Promise<void>;
  updateReward: (childId: string, rewardId: string, updates: Partial<Reward>) => Promise<void>;
  deleteReward: (childId: string, rewardId: string) => Promise<void>;
  deleteHistoryEntry: (childId: string, entryId: string, pointsAdjustment: number, taskRestore?: { name: string, dateStr: string }) => Promise<void>;
  addPoints: (childId: string, points: number, reason: string) => Promise<void>;
  resetChildData: (childId: string) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  
  // Nuevos estados para subcolecciones
  const [familyConfig, setFamilyConfig] = useState<FamilyDoc | null>(null);
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [activeChildTasks, setActiveChildTasks] = useState<Task[]>([]);
  const [activeChildRewards, setActiveChildRewards] = useState<Reward[]>([]);
  const [activeChildHistory, setActiveChildHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [activeChildId, setActiveChildId] = useState<string | null>(() => window.localStorage.getItem('einar_active_child'));
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [showCelebration, setShowCelebration] = useState<CelebrationState>({
    show: false, title: '', subtitle: '', type: 'success'
  });

  // Helper to parse dates from various formats (string, Timestamp, Date)
  const parseDate = (date: any): Date => {
    if (!date) return new Date(0);
    if (typeof date === 'string') return parseISO(date);
    if (date.toDate && typeof date.toDate === 'function') return date.toDate();
    return new Date(date);
  };

  // Objeto de estado computado para mantener compatibilidad con componentes existentes
  const state = useMemo<AppState | null>(() => {
    if (!familyConfig) return null;
    return {
      ...familyConfig,
      children: childrenList.map(c => 
        c.id === activeChildId 
          ? { ...c, tasks: activeChildTasks, rewards: activeChildRewards, history: activeChildHistory }
          : c
      )
    };
  }, [familyConfig, childrenList, activeChildId, activeChildTasks, activeChildRewards, activeChildHistory]);

  const activeChild = useMemo(() => {
    if (childrenList.length === 0) return null;
    const found = activeChildId ? childrenList.find(c => c.id === activeChildId) : childrenList[0];
    const baseChild = found || childrenList[0];
    
    // Inyectar datos de subcolecciones si es el niño activo
    if (baseChild.id === activeChildId) {
      return {
        ...baseChild,
        tasks: activeChildTasks,
        rewards: activeChildRewards,
        history: activeChildHistory
      };
    }
    return baseChild;
  }, [childrenList, activeChildId, activeChildTasks, activeChildRewards, activeChildHistory]);

  useEffect(() => {
    if (activeChildId) {
      window.localStorage.setItem('einar_active_child', activeChildId);
    }
  }, [activeChildId]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setFamilyId(null);
        setNeedsOnboarding(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Family Discovery Effect
  useEffect(() => {
    if (!authReady || !user || !user.email || familyId) return;

    const familiesRef = collection(db, 'families');
    const q = query(familiesRef, where('allowedEmails', 'array-contains', user.email));

    const discoverFamily = async () => {
      try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setNeedsOnboarding(true);
        } else {
          const docData = querySnapshot.docs[0].data();
          const docId = querySnapshot.docs[0].id;
          
          // Migración automática si es necesario
          if (!docData.migrated) {
            await migrateFamilyToSubcollections(db, docId, docData);
          }
          
          setFamilyId(docId);
          setNeedsOnboarding(false);
        }
      } catch (error) {
        console.error("Error discovering family:", error);
        handleFirestoreError(error, OperationType.GET, 'families');
      }
    };

    discoverFamily();
  }, [user, authReady, familyId]);

  // 1. Escuchar Configuración de Familia
  useEffect(() => {
    if (!familyId) return;
    const unsubscribe = onSnapshot(doc(db, 'families', familyId), (snap) => {
      if (snap.exists()) setFamilyConfig(snap.data() as FamilyDoc);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `families/${familyId}`);
    });
    return () => unsubscribe();
  }, [familyId]);

  // 2. Escuchar Niños
  useEffect(() => {
    if (!familyId) return;
    const unsubscribe = onSnapshot(collection(db, 'families', familyId, 'children'), (snap) => {
      const list = snap.docs.map(d => ({ ...d.data() }) as ChildProfile);
      setChildrenList(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `families/${familyId}/children`);
    });
    return () => unsubscribe();
  }, [familyId]);

  // 3. Escuchar Datos del Niño Activo (Misiones y Premios)
  useEffect(() => {
    if (!familyId || !activeChildId) {
      setActiveChildTasks([]);
      setActiveChildRewards([]);
      return;
    }
    
    const tasksUnsub = onSnapshot(collection(db, 'families', familyId, 'children', activeChildId, 'tasks'), (snap) => {
      setActiveChildTasks(snap.docs.map(d => d.data() as Task));
    });

    const rewardsUnsub = onSnapshot(collection(db, 'families', familyId, 'children', activeChildId, 'rewards'), (snap) => {
      setActiveChildRewards(snap.docs.map(d => d.data() as Reward));
    });

    return () => {
      tasksUnsub();
      rewardsUnsub();
    };
  }, [familyId, activeChildId]);

  // 4. Cargar Historial (Query, no realtime para ahorrar lecturas y permitir crecimiento infinito)
  const loadHistory = async (childId: string) => {
    if (!familyId) return;
    setIsLoadingHistory(true);
    try {
      const historyRef = collection(db, 'families', familyId, 'children', childId, 'history');
      const q = query(historyRef, orderBy('date', 'desc'), limit(50));
      const snap = await getDocs(q);
      setActiveChildHistory(snap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryEntry)));
    } catch (e) {
      console.error("Error loading history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (familyId && activeChildId) {
      loadHistory(activeChildId);
    } else {
      setActiveChildHistory([]);
    }
  }, [familyId, activeChildId]);

  // Apply theme to body
  useEffect(() => {
    if (activeChild?.theme) {
      document.body.className = `theme-${activeChild.theme}`;
    } else {
      document.body.className = 'theme-robots'; // Default
    }
  }, [activeChild?.theme]);

  // Check for midnight reset
  useEffect(() => {
    const checkReset = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      if (currentDate !== today) {
        setCurrentDate(today);
      }
      
      if (!state || !familyId) return;
      
      const lastReset = window.localStorage.getItem('einar_last_reset');
      if (lastReset !== today) {
        window.localStorage.setItem('einar_last_reset', today);
      }
    };

    checkReset();
    const interval = setInterval(checkReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state, familyId, currentDate]);

  const sanitizeForFirestore = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeForFirestore);
    }
    const sanitized: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        sanitized[key] = sanitizeForFirestore(obj[key]);
      }
    }
    return sanitized;
  };

  const handleOnboardingComplete = async (onboardingData: Pick<ChildProfile, 'name' | 'theme' | 'tasks' | 'rewards'>) => {
    if (!user || !user.email) return;
    try {
      const batch = writeBatch(db);
      const familyRef = doc(collection(db, 'families'));
      
      const familyData: FamilyDoc = {
        ...INITIAL_STATE,
        allowedEmails: [user.email],
        migrated: true
      };
      
      batch.set(familyRef, sanitizeForFirestore(familyData));

      const childId = crypto.randomUUID();
      const childRef = doc(collection(familyRef, 'children'), childId);
      
      const { tasks, rewards, ...childInfo } = onboardingData;
      const childDoc = {
        ...childInfo,
        id: childId,
        totalPoints: 0
      };
      
      batch.set(childRef, sanitizeForFirestore(childDoc));

      // Agregar misiones iniciales
      tasks.forEach(t => {
        const tRef = doc(collection(childRef, 'tasks'), t.id);
        batch.set(tRef, sanitizeForFirestore({ ...t, completedDates: [] }));
      });

      // Agregar premios iniciales
      rewards.forEach(r => {
        const rRef = doc(collection(childRef, 'rewards'), r.id);
        batch.set(rRef, sanitizeForFirestore(r));
      });

      await batch.commit();
      
      setFamilyId(familyRef.id);
      setActiveChildId(childId);
      setNeedsOnboarding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'families');
    }
  };

  const addChild = async (childData: Pick<ChildProfile, 'name' | 'theme' | 'tasks' | 'rewards'>) => {
    if (!familyId) return;
    try {
      const batch = writeBatch(db);
      const childId = crypto.randomUUID();
      const childRef = doc(collection(db, 'families', familyId, 'children'), childId);
      
      const { tasks, rewards, ...childInfo } = childData;
      const childDoc = {
        ...childInfo,
        id: childId,
        totalPoints: 0
      };
      
      batch.set(childRef, sanitizeForFirestore(childDoc));

      if (tasks) {
        tasks.forEach(t => {
          const tRef = doc(collection(childRef, 'tasks'), t.id);
          batch.set(tRef, sanitizeForFirestore({ ...t, completedDates: [] }));
        });
      }

      if (rewards) {
        rewards.forEach(r => {
          const rRef = doc(collection(childRef, 'rewards'), r.id);
          batch.set(rRef, sanitizeForFirestore(r));
        });
      }

      await batch.commit();
      setActiveChildId(childId);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}`);
    }
  };

  const deleteChild = async (childId: string) => {
    if (!familyId || childrenList.length <= 1) return;
    try {
      // Nota: Borrar una subcolección requiere borrar cada doc. 
      // Por simplicidad en este MVP borramos el doc del niño.
      // Las misiones/premios/history quedarán huérfanos pero no se verán.
      await deleteDoc(doc(db, 'families', familyId, 'children', childId));
      
      if (activeChildId === childId) {
        const nextChild = childrenList.find(c => c.id !== childId);
        if (nextChild) setActiveChildId(nextChild.id);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}`);
    }
  };

  const updateState = async (updates: Partial<FamilyDoc>) => {
    if (!familyId) return;
    try {
      await updateDoc(doc(db, 'families', familyId), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}`);
    }
  };

  const updateChildState = async (childId: string, updates: Partial<ChildProfile>) => {
    if (!familyId) return;
    try {
      const { tasks, rewards, history, ...rest } = updates;
      await updateDoc(doc(db, 'families', familyId, 'children', childId), sanitizeForFirestore(rest));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}/children/${childId}`);
    }
  };

  const addTask = async (childId: string, task: Task) => {
    if (!familyId) return;
    try {
      await setDoc(doc(db, 'families', familyId, 'children', childId, 'tasks', task.id), sanitizeForFirestore(task));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const updateTask = async (childId: string, taskId: string, updates: Partial<Task>) => {
    if (!familyId) return;
    try {
      await updateDoc(doc(db, 'families', familyId, 'children', childId, 'tasks', taskId), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteTask = async (childId: string, taskId: string) => {
    if (!familyId) return;
    try {
      await deleteDoc(doc(db, 'families', familyId, 'children', childId, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  const addReward = async (childId: string, reward: Reward) => {
    if (!familyId) return;
    try {
      await setDoc(doc(db, 'families', familyId, 'children', childId, 'rewards', reward.id), sanitizeForFirestore(reward));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rewards/${reward.id}`);
    }
  };

  const updateReward = async (childId: string, rewardId: string, updates: Partial<Reward>) => {
    if (!familyId) return;
    try {
      await updateDoc(doc(db, 'families', familyId, 'children', childId, 'rewards', rewardId), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rewards/${rewardId}`);
    }
  };

  const deleteReward = async (childId: string, rewardId: string) => {
    if (!familyId) return;
    try {
      await deleteDoc(doc(db, 'families', familyId, 'children', childId, 'rewards', rewardId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `rewards/${rewardId}`);
    }
  };

  const deleteHistoryEntry = async (childId: string, entryId: string, pointsAdjustment: number, taskRestore?: { name: string, dateStr: string }) => {
    if (!familyId) return;
    try {
      const batch = writeBatch(db);
      const childRef = doc(db, 'families', familyId, 'children', childId);
      
      // 1. Revertir puntos
      batch.update(childRef, {
        totalPoints: Math.max(0, (childrenList.find(c => c.id === childId)?.totalPoints || 0) - pointsAdjustment)
      });

      // 2. Si era una misión, quitar la fecha de completado
      if (taskRestore) {
        // Necesitamos encontrar el ID de la misión por su nombre
        // Esto es un poco frágil pero es como está diseñado el sistema
        const tasksSnap = await getDocs(collection(childRef, 'tasks'));
        const taskDoc = tasksSnap.docs.find(d => d.data().name === taskRestore.name);
        if (taskDoc) {
          const taskData = taskDoc.data() as Task;
          const newDates = (taskData.completedDates || []).filter(d => d !== taskRestore.dateStr);
          batch.update(taskDoc.ref, { completedDates: newDates });
        }
      }

      // 3. Borrar la entrada
      batch.delete(doc(childRef, 'history', entryId));

      await batch.commit();
      loadHistory(childId);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `history/${entryId}`);
    }
  };

  const addPoints = async (childId: string, points: number, reason: string) => {
    if (!familyId) return;
    try {
      const batch = writeBatch(db);
      const childRef = doc(db, 'families', familyId, 'children', childId);
      const historyRef = doc(collection(childRef, 'history'));

      batch.update(childRef, {
        totalPoints: Math.max(0, (childrenList.find(c => c.id === childId)?.totalPoints || 0) + points)
      });

      batch.set(historyRef, {
        date: new Date().toISOString(),
        dateStr: currentDate,
        points: points,
        reason: reason,
        type: 'admin'
      });

      await batch.commit();
      loadHistory(childId);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `points/${childId}`);
    }
  };

  const resetChildData = async (childId: string) => {
    if (!familyId) return;
    try {
      const batch = writeBatch(db);
      const childRef = doc(db, 'families', familyId, 'children', childId);
      
      batch.update(childRef, { totalPoints: 0 });

      // Resetear fechas de misiones
      const tasksSnap = await getDocs(collection(childRef, 'tasks'));
      tasksSnap.forEach(tDoc => {
        batch.update(tDoc.ref, { completedDates: [] });
      });

      // Borrar historial (esto es pesado si hay miles, pero para el reset semanal está bien)
      const historySnap = await getDocs(collection(childRef, 'history'));
      historySnap.forEach(hDoc => {
        batch.delete(hDoc.ref);
      });

      await batch.commit();
      loadHistory(childId);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reset/${childId}`);
    }
  };

  const deleteFamily = async () => {
    if (!familyId) return;
    try {
      await deleteDoc(doc(db, 'families', familyId));
      setFamilyId(null);
      setNeedsOnboarding(false);
      await logout();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `families/${familyId}`);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f2ff', '#ffcc00', '#ffffff'],
    });
  };

  const triggerCelebration = (title: string, subtitle: string, type: 'success' | 'penalty' | 'warning' = 'success') => {
    setShowCelebration({ show: true, title, subtitle, type });
    setTimeout(() => setShowCelebration({ show: false, title: '', subtitle: '', type: 'success' }), 4000);
  };

  const pointsToday = useMemo(() => {
    if (!activeChild) return 0;
    const history = activeChildHistory || [];
    const total = history
      .filter(entry => {
        if (entry.type && entry.type !== 'earn') return false;
        if (entry.dateStr === currentDate) return true;
        try {
          const parsedDate = parseDate(entry.date);
          if (!isNaN(parsedDate.getTime())) {
            const entryDateStr = format(parsedDate, 'yyyy-MM-dd');
            return entryDateStr === currentDate;
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
        return false;
      })
      .reduce((sum, entry) => sum + (Number(entry.points) || 0), 0);
    return Math.max(0, total);
  }, [activeChildHistory, currentDate]);

  const weeklyData = useMemo(() => {
    if (!activeChild) return [];
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const history = activeChildHistory || [];

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const pointsEarned = history
        .filter(entry => {
          if (entry.type && entry.type !== 'earn') return false;
          if (entry.dateStr === dayStr) return true;
          try {
            const parsedDate = parseDate(entry.date);
            if (!isNaN(parsedDate.getTime())) {
              const entryDateStr = format(parsedDate, 'yyyy-MM-dd');
              return entryDateStr === dayStr;
            }
          } catch (e) {
            console.error("Error parsing date:", e);
          }
          return false;
        })
        .reduce((sum, entry) => sum + (Number(entry.points) || 0), 0);

      return {
        name: format(day, 'EEE', { locale: es }).toUpperCase(),
        points: Math.max(0, pointsEarned),
        fullDate: dayStr,
      };
    });
  }, [activeChildHistory, currentDate]);

  const nextReward = useMemo(() => {
    if (!activeChild) return null;
    return activeChildRewards
      .filter(r => r.cost > (activeChild.totalPoints || 0))
      .sort((a, b) => a.cost - b.cost)[0] || activeChildRewards[activeChildRewards.length - 1];
  }, [activeChildRewards, activeChild?.totalPoints]);

  const handleCompleteTask = async (taskId: string) => {
    if (!familyId || !activeChild || !state) return;
    const task = activeChildTasks.find(t => t.id === taskId);
    
    if (!task) return;

    const isCompletedSingle = state.taskMode === 'single' && (task.completedDates || []).includes(currentDate);
    const wouldExceedMax = state.taskMode === 'repeatable' && (pointsToday + task.points > state.maxDailyPoints);

    if (isCompletedSingle || wouldExceedMax) return;

    const isPenalty = task.points < 0;

    if (!isPenalty) {
      droidSounds.playTaskComplete();
      triggerConfetti();
    } else {
      droidSounds.playError();
    }

    try {
      const batch = writeBatch(db);
      const childRef = doc(db, 'families', familyId, 'children', activeChild.id);
      const taskRef = doc(db, 'families', familyId, 'children', activeChild.id, 'tasks', taskId);
      const historyRef = doc(collection(childRef, 'history'));

      batch.update(taskRef, {
        completedDates: [...(task.completedDates || []), currentDate]
      });

      batch.update(childRef, {
        totalPoints: Math.max(0, (activeChild.totalPoints || 0) + task.points)
      });

      batch.set(historyRef, {
        date: new Date().toISOString(),
        dateStr: currentDate,
        points: task.points,
        reason: `Misión completada: ${task.name}`,
        type: 'earn'
      });

      await batch.commit();
      
      if (isPenalty) {
        triggerCelebration('¡ATENCIÓN!', `Has perdido ${Math.abs(task.points)} puntos`, 'penalty');
      } else {
        triggerCelebration('¡MISIÓN CUMPLIDA!', `Has ganado ${task.points} puntos`, 'success');
      }
      
      loadHistory(activeChild.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}`);
    }
  };

  const redemptionsToday = useMemo(() => {
    if (!activeChildHistory) return 0;
    return activeChildHistory.filter(entry => {
      if (entry.type !== 'spend') return false;
      if (entry.dateStr) return entry.dateStr === currentDate;
      try {
        const entryDate = parseDate(entry.date);
        return format(entryDate, 'yyyy-MM-dd') === currentDate;
      } catch {
        return false;
      }
    }).length;
  }, [activeChildHistory, currentDate]);

  const handleRedeemReward = async (rewardId: string) => {
    if (!familyId || !activeChild) return;
    const reward = activeChildRewards.find(r => r.id === rewardId);
    if (!reward || (activeChild.totalPoints || 0) < reward.cost) return;

    // Check availability
    const day = new Date().getDay();
    const available = !reward.availableDays || 
                     reward.availableDays.length === 0 || 
                     reward.availableDays.length === 7 || 
                     reward.availableDays.includes(day);

    if (!available) {
      triggerCelebration('¡NO DISPONIBLE!', 'Este premio no se puede canjear hoy.', 'warning');
      return;
    }

    // Limit to 2 redemptions per day
    if (redemptionsToday >= 2) {
      triggerCelebration('¡LÍMITE ALCANZADO!', 'Solo puedes canjear 2 premios al día. ¡Mañana más!', 'warning');
      return;
    }

    try {
      const batch = writeBatch(db);
      const childRef = doc(db, 'families', familyId, 'children', activeChild.id);
      const historyRef = doc(collection(childRef, 'history'));

      droidSounds.playRewardRedeem();
      triggerConfetti();

      batch.update(childRef, {
        totalPoints: Math.max(0, (activeChild.totalPoints || 0) - reward.cost)
      });

      batch.set(historyRef, {
        date: new Date().toISOString(),
        dateStr: currentDate,
        points: -reward.cost,
        reason: `Recompensa canjeada: ${reward.name}`,
        type: 'spend'
      });

      await batch.commit();
      triggerCelebration('¡RECOMPENSA DESBLOQUEADA!', `Has conseguido: ${reward.name}`, 'success');
      loadHistory(activeChild.id);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `families/${familyId}`);
    }
  };

  return (
    <FamilyContext.Provider value={{
      user,
      authReady,
      familyId,
      familyConfig,
      state,
      childrenList,
      activeChildTasks,
      activeChildRewards,
      activeChildHistory,
      isLoadingHistory,
      loadHistory,
      activeChildId,
      activeChild,
      needsOnboarding,
      pointsToday,
      redemptionsToday,
      nextReward,
      weeklyData,
      showCelebration,
      currentDate,
      updateState,
      updateChildState,
      deleteFamily,
      handleOnboardingComplete,
      handleCompleteTask,
      handleRedeemReward,
      triggerCelebration,
      setActiveChildId,
      addChild,
      deleteChild,
      addTask,
      updateTask,
      deleteTask,
      addReward,
      updateReward,
      deleteReward,
      deleteHistoryEntry,
      addPoints,
      resetChildData
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
