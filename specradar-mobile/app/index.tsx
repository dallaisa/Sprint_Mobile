import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { getSession } from '@/src/storage/session';

export default function Index() {
  const [target, setTarget] = useState<'/login' | '/(tabs)/home' | null>(null);

  // Com "Lembrar de mim", a sessão salva leva direto ao início.
  useEffect(() => {
    let active = true;
    getSession()
      .then((session) => { if (active) setTarget(session ? '/(tabs)/home' : '/login'); })
      .catch(() => { if (active) setTarget('/login'); });
    return () => { active = false; };
  }, []);

  return target ? <Redirect href={target} /> : null;
}
