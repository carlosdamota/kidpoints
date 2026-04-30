import { writeBatch, doc, collection, deleteField, Firestore } from "firebase/firestore";
import { ChildProfile } from "../types";

/**
 * Migra una familia del modelo monolítico (todo en un doc) al modelo de subcolecciones.
 */
export async function migrateFamilyToSubcollections(db: Firestore, familyId: string, docData: any) {
  if (docData.migrated) return;

  console.log(`Iniciando migración para familia: ${familyId}`);
  const batch = writeBatch(db);
  const familyRef = doc(db, "families", familyId);

  const children = (docData.children as ChildProfile[]) || [];

  for (const child of children) {
    const childRef = doc(collection(familyRef, "children"), child.id);
    
    // 1. Extraer arrays para subcolecciones
    const { tasks, rewards, history, ...childInfo } = child;
    
    // 2. Crear documento del niño
    batch.set(childRef, childInfo);

    // 3. Migrar Misiones
    if (tasks && Array.isArray(tasks)) {
      tasks.forEach(task => {
        const taskRef = doc(collection(childRef, "tasks"), task.id);
        batch.set(taskRef, task);
      });
    }

    // 4. Migrar Premios
    if (rewards && Array.isArray(rewards)) {
      rewards.forEach(reward => {
        const rewardRef = doc(collection(childRef, "rewards"), reward.id);
        batch.set(rewardRef, reward);
      });
    }

    // 5. Migrar Historial
    if (history && Array.isArray(history)) {
      history.forEach(entry => {
        // El historial viejo no tenía IDs, generamos uno nuevo para cada entrada
        const historyRef = doc(collection(childRef, "history"));
        batch.set(historyRef, entry);
      });
    }
  }

  // 6. Marcar como migrado y limpiar el documento principal
  batch.update(familyRef, {
    migrated: true,
    children: deleteField()
  });

  await batch.commit();
  console.log(`Migración de familia ${familyId} completada con éxito.`);
}
