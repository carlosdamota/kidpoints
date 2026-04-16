import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import confetti from 'canvas-confetti';

import { auth, db, logout } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { AppState, ChildProfile } from '../types';
import { INITIAL_STATE } from '../constants';
import { droidSounds } from '../lib/sounds';

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
  state: FamilyData | null;
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
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [state, setState] = useState<FamilyData | null>(null);
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

  const activeChild = useMemo(() => {
    if (!state || !activeChildId) return state?.children?.[0] || null;
    return state.children.find(c => c.id === activeChildId) || state.children[0] || null;
  }, [state, activeChildId]);

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
        setState(null);
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
          
          // Migration for existing families to add new fields and support multi-child
          const updates: any = {};
          
          // Old structure fields
          const oldChildName = docData.childName;
          const oldTheme = docData.theme;
          const oldTotalPoints = docData.totalPoints;
          const oldTasks = docData.tasks;
          const oldRewards = docData.rewards;
          const oldHistory = docData.history;

          if (!docData.children) {
            // Perform migration to multi-child
            const initialChild: ChildProfile = {
              id: crypto.randomUUID(),
              name: oldChildName || 'Einar',
              theme: oldTheme || 'robots',
              totalPoints: oldTotalPoints ?? 0,
              tasks: (oldTasks || []).map((t: any) => ({
                ...t,
                completedDates: t.completedDates || []
              })),
              rewards: oldRewards || [],
              history: oldHistory || [],
            };
            updates.children = [initialChild];
          }

          if (!docData.taskMode || docData.maxDailyPoints === undefined) {
            updates.taskMode = docData.taskMode || 'single';
            updates.maxDailyPoints = docData.maxDailyPoints ?? 10;
          }
          
          if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'families', docId), updates);
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

  // Data Listening Effect
  useEffect(() => {
    if (!familyId) return;

    const unsubscribe = onSnapshot(doc(db, 'families', familyId), (docSnap) => {
      if (docSnap.exists()) {
        setState(docSnap.data() as FamilyData);
      }
    }, (error) => {
      console.error("Error listening to family data:", error);
      handleFirestoreError(error, OperationType.GET, `families/${familyId}`);
    });

    return () => unsubscribe();
  }, [familyId]);

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
      const firstChild: ChildProfile = {
        ...onboardingData,
        id: crypto.randomUUID(),
        totalPoints: 0,
        history: [],
      };
      const newFamilyData: FamilyData = {
        ...INITIAL_STATE,
        children: [firstChild],
        allowedEmails: [user.email],
      };
      const docRef = await addDoc(collection(db, 'families'), sanitizeForFirestore(newFamilyData));
      setFamilyId(docRef.id);
      setActiveChildId(firstChild.id);
      setNeedsOnboarding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'families');
    }
  };

  const addChild = async (childData: Pick<ChildProfile, 'name' | 'theme' | 'tasks' | 'rewards'>) => {
    if (!state || !familyId) return;
    try {
      const newChild: ChildProfile = {
        ...childData,
        id: crypto.randomUUID(),
        totalPoints: 0,
        history: [],
      };
      await updateDoc(doc(db, 'families', familyId), {
        children: sanitizeForFirestore([...state.children, newChild])
      });
      setActiveChildId(newChild.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}`);
    }
  };

  const deleteChild = async (childId: string) => {
    if (!state || !familyId || state.children.length <= 1) return;
    try {
      const newChildren = state.children.filter(c => c.id !== childId);
      await updateDoc(doc(db, 'families', familyId), {
        children: sanitizeForFirestore(newChildren)
      });
      if (activeChildId === childId) {
        setActiveChildId(newChildren[0].id);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}`);
    }
  };

  const updateState = async (updates: Partial<FamilyData>) => {
    if (!familyId) return;
    try {
      await updateDoc(doc(db, 'families', familyId), sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}`);
    }
  };

  const updateChildState = async (childId: string, updates: Partial<ChildProfile>) => {
    if (!state || !familyId) return;
    try {
      const updatedChildren = state.children.map(c => 
        c.id === childId ? { ...c, ...updates } : c
      );
      await updateDoc(doc(db, 'families', familyId), { children: sanitizeForFirestore(updatedChildren) });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}`);
    }
  };

  const deleteFamily = async () => {
    if (!familyId) return;
    try {
      await deleteDoc(doc(db, 'families', familyId));
      setState(null);
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
    const history = activeChild.history || [];
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
  }, [activeChild?.history, currentDate]);

  const weeklyData = useMemo(() => {
    if (!activeChild) return [];
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const history = activeChild.history || [];

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
  }, [activeChild?.history, currentDate]);

  const nextReward = useMemo(() => {
    if (!activeChild) return null;
    return activeChild.rewards
      .filter(r => r.cost > activeChild.totalPoints)
      .sort((a, b) => a.cost - b.cost)[0] || activeChild.rewards[activeChild.rewards.length - 1];
  }, [activeChild?.rewards, activeChild?.totalPoints]);

  const handleCompleteTask = (taskId: string) => {
    if (!state || !activeChild) return;
    const task = activeChild.tasks.find(t => t.id === taskId);
    
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

    const newTotalPoints = Math.max(0, (activeChild.totalPoints || 0) + task.points);

    updateChildState(activeChild.id, {
      totalPoints: newTotalPoints,
      tasks: activeChild.tasks.map(t => 
        t.id === taskId ? { ...t, completedDates: [...(t.completedDates || []), currentDate] } : t
      ),
      history: [
        {
          date: new Date().toISOString(),
          dateStr: currentDate,
          points: task.points,
          reason: `Misión completada: ${task.name}`,
          type: 'earn' as const,
        },
        ...(activeChild.history || []),
      ].slice(0, 100),
    });
    
    if (isPenalty) {
      triggerCelebration('¡ATENCIÓN!', `Has perdido ${Math.abs(task.points)} puntos`, 'penalty');
    } else {
      triggerCelebration('¡MISIÓN CUMPLIDA!', `Has ganado ${task.points} puntos`, 'success');
    }
  };

  const redemptionsToday = useMemo(() => {
    if (!activeChild?.history) return 0;
    return activeChild.history.filter(entry => {
      if (entry.type !== 'spend') return false;
      if (entry.dateStr) return entry.dateStr === currentDate;
      try {
        const entryDate = parseDate(entry.date);
        return format(entryDate, 'yyyy-MM-dd') === currentDate;
      } catch {
        return false;
      }
    }).length;
  }, [activeChild?.history, currentDate]);

  const handleRedeemReward = (rewardId: string) => {
    if (!activeChild) return;
    const reward = activeChild.rewards.find(r => r.id === rewardId);
    if (!reward || activeChild.totalPoints < reward.cost) return;

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

    droidSounds.playRewardRedeem();
    triggerConfetti();

    updateChildState(activeChild.id, {
      totalPoints: Math.max(0, (activeChild.totalPoints || 0) - reward.cost),
      history: [
        {
          date: new Date().toISOString(),
          dateStr: currentDate,
          points: -reward.cost,
          reason: `Recompensa canjeada: ${reward.name}`,
          type: 'spend' as const,
        },
        ...(activeChild.history || []),
      ].slice(0, 100),
    });

    triggerCelebration('¡RECOMPENSA DESBLOQUEADA!', `Has conseguido: ${reward.name}`, 'success');
  };

  return (
    <FamilyContext.Provider value={{
      user,
      authReady,
      familyId,
      state,
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
      deleteChild
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
