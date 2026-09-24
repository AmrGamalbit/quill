import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export default function useUserEmail() {
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email);
    });
  }, []);

  return email;
}
