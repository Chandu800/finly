import { act, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./components/DashboardHome";
import { Route, Routes } from "react-router-dom";
import Accounts from "./components/Accounts";
import Transactions from "./components/Transactions"
import Budgets from "./components/Budgets"
import Goals from "./components/Goals"
import Reports from "./components/Reports"
import SendFeedback from "./components/SendFeedback";

function App() {
  const [session, setSession] = useState(null);
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch accounts when session changes
  useEffect(() => {
    const fetchAccounts = async() => {
      if(session?.user?.id) {
        const {data} = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", session.user.id);
        setAccounts(data || []);
      }
    };
    fetchAccounts();
  }, [session]);

  if (!session) return <Auth />;

  return (
      <DashboardLayout user={session.user}>
        <Routes>
          <Route path="/" element={<DashboardHome user={session.user} />} />
          <Route path="/accounts" element={<Accounts user={session.user} />} />
          <Route path="/transactions" element={<Transactions user={session.user} accounts={accounts} />} />
          <Route path="/budgets" element={<Budgets user={session.user} />} />
          <Route path="/goals" element={<Goals user={session.user}/>}/>
          <Route path="/reports" element={<Reports user={session.user}/>} />
          <Route path="/sendfeedback" element={<SendFeedback/>} />
        </Routes>
      </DashboardLayout>
  );
}

export default App;
