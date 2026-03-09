import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setUserProfile({ id: profileDoc.id, ...data });
          setCart(data.cart || []);
        } else {
          // First-time social login — auto-create profile from Firebase user info
          const autoProfile = {
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...autoProfile,
            cart: [],
            updatedAt: serverTimestamp(),
          }, { merge: true });
          setUserProfile({ id: firebaseUser.uid, ...autoProfile });
        }
      } else {
        setUserProfile(null);
        setMyItems([]);
        setCart([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Listen to current user's items
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'items'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        tradedAt: d.data().tradedAt?.toDate?.()?.toISOString() || null,
      }));
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMyItems(items);
    });
    return unsub;
  }, [user]);

  // Listen to ALL available items (marketplace)
  useEffect(() => {
    const q = query(collection(db, 'items'), where('status', '==', 'available'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        tradedAt: d.data().tradedAt?.toDate?.()?.toISOString() || null,
      }));
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllItems(items);
    });
    return unsub;
  }, []);

  const saveUserProfile = useCallback(async (uid, profile) => {
    await setDoc(doc(db, 'users', uid), {
      ...profile,
      cart: [],
      updatedAt: serverTimestamp(),
    }, { merge: true });
    setUserProfile({ id: uid, ...profile });
  }, []);

  const updateUserProfile = useCallback(async (uid, profileUpdates) => {
    if (!uid) return;
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...profileUpdates,
        updatedAt: serverTimestamp(),
      });
      setUserProfile((prev) => ({ ...prev, ...profileUpdates }));
    } catch (error) {
      console.error("Failed to update profile", error);
      throw error;
    }
  }, []);

  const addItem = useCallback(async (itemData) => {
    if (!user || !userProfile) return;
    const docRef = await addDoc(collection(db, 'items'), {
      ...itemData,
      userId: user.uid,
      userName: userProfile.name,
      userPhone: userProfile.phone,
      status: 'available',
      createdAt: serverTimestamp(),
      tradedAt: null,
    });
    return docRef.id;
  }, [user, userProfile]);

  const updateItem = useCallback(async (itemId, data) => {
    await updateDoc(doc(db, 'items', itemId), data);
  }, []);

  const markTraded = useCallback(async (itemId) => {
    await updateDoc(doc(db, 'items', itemId), { status: 'traded', tradedAt: serverTimestamp() });
  }, []);

  const markAvailable = useCallback(async (itemId) => {
    await updateDoc(doc(db, 'items', itemId), { status: 'available', tradedAt: null });
  }, []);

  const bulkMarkTraded = useCallback(async (itemIds) => {
    const batch = writeBatch(db);
    itemIds.forEach((id) => {
      batch.update(doc(db, 'items', id), { status: 'traded', tradedAt: serverTimestamp() });
    });
    await batch.commit();
  }, []);

  const deleteItem = useCallback(async (itemId) => {
    await deleteDoc(doc(db, 'items', itemId));
  }, []);

  // Cart operations
  const addToCart = useCallback(async (itemId) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { cart: arrayUnion(itemId) });
    setCart((prev) => prev.includes(itemId) ? prev : [...prev, itemId]);
  }, [user]);

  const removeFromCart = useCallback(async (itemId) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { cart: arrayRemove(itemId) });
    setCart((prev) => prev.filter((id) => id !== itemId));
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { cart: [] });
    setCart([]);
  }, [user]);

  const isInCart = useCallback((itemId) => cart.includes(itemId), [cart]);

  // Confirm trade: create trade doc, deduct quantities, clear cart
  const confirmTrade = useCallback(async (cartItems) => {
    if (!user || !userProfile || cartItems.length === 0) return null;

    const batch = writeBatch(db);

    // Create trade document
    const tradeRef = doc(collection(db, 'trades'));
    const tradeData = {
      buyerId: user.uid,
      buyerName: userProfile.name,
      buyerPhone: userProfile.phone,
      status: 'confirmed',
      confirmedAt: serverTimestamp(),
      items: cartItems.map((item) => ({
        itemId: item.id,
        itemName: item.name,
        qty: item.cartQty || 1,
        sellerId: item.userId,
        sellerName: item.userName,
        sellerPhone: item.userPhone,
        exchangeLocation: item.exchangeLocation || '',
        tradeRequests: item.tradeRequests || [],
      })),
    };
    batch.set(tradeRef, tradeData);

    // Deduct quantities from each item
    for (const item of cartItems) {
      const deductQty = item.cartQty || 1;
      const newQty = Math.max(0, (item.availableQty || 1) - deductQty);
      const itemRef = doc(db, 'items', item.id);
      if (newQty <= 0) {
        batch.update(itemRef, {
          availableQty: 0,
          status: 'traded',
          tradedAt: serverTimestamp(),
        });
      } else {
        batch.update(itemRef, { availableQty: newQty });
      }
    }

    // Clear cart
    const userRef = doc(db, 'users', user.uid);
    batch.update(userRef, { cart: [] });

    await batch.commit();
    setCart([]);
    return tradeRef.id;
  }, [user, userProfile]);

  const value = {
    user, userProfile, myItems, allItems, cart, loading,
    saveUserProfile, updateUserProfile, addItem, updateItem,
    markTraded, markAvailable, bulkMarkTraded, deleteItem,
    addToCart, removeFromCart, clearCart, isInCart, confirmTrade,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}
