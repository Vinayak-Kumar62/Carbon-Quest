import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Bike,
  Car,
  Train,
  Plane,
  Bus,
  Zap,
  Sparkles,
  LineChart as LineChartIcon,
  Drumstick,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    collection,
    query,
    onSnapshot,
} from "firebase/firestore";

// --- Firebase Configuration & Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Mock shadcn/ui Components ---
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-xl border bg-white text-gray-900 shadow ${className}`}
    {...props}
  />
));
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
));
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    const variantClasses = {
        default: "bg-green-600 text-white shadow hover:bg-green-600/90",
        outline: "border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
    };
    const sizeClasses = { default: "h-9 px-4 py-2", icon: "h-9 w-9" };
    return (
        <button
            className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} ${className}`}
            ref={ref}
            {...props}
        />
    );
});

// --- Helper Functions ---
const formatDate = (date) => date.toISOString().split('T')[0];
const calculateFootprint = (log) => {
    if (!log) return 0;
    return (
        log.bikeKm * 0.02 +
        log.carKm * 0.21 +
        log.busKm * 0.1 +
        log.trainKm * 0.05 +
        log.planeKm * 0.255 +
        log.nonVegMeals * 2.5 +
        log.packagedItems * 1.2 +
        log.energyKwh * 0.5
    );
};


// --- Custom Components ---
const NumberField = ({ icon, label, unit, value, onChange }) => (
  <div className="flex items-center space-x-3 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition">
    {icon}
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        className="w-full border-gray-300 rounded-lg p-2 mt-1 text-sm focus:ring-green-500 focus:border-green-500"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        min="0"
      />
      <span className="text-xs text-gray-500">{unit}</span>
    </div>
  </div>
);

const DashboardCard = ({ title, value, icon }) => (
  <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </CardContent>
  </Card>
);

const ImpactCard = ({ icon, title, value, subtitle }) => (
  <motion.div whileHover={{ scale: 1.05 }} className="p-4 rounded-2xl bg-white shadow-md hover:shadow-xl transition">
    <div className="flex items-center space-x-3">
      {icon}
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-2xl font-bold text-green-600">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  </motion.div>
);


// --- Main App ---
export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notification, setNotification] = useState('');

  // --- Authentication Effect ---
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Authentication failed:", error);
      }
    };
    authenticateUser();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if(!currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Firestore Data Fetching Effect ---
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const logsCollectionPath = collection(db, "artifacts", appId, "users", user.uid, "userLogs");
    const q = query(logsCollectionPath);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedLogs = {};
      querySnapshot.forEach((doc) => {
        fetchedLogs[doc.id] = doc.data();
      });
      setLogs(fetchedLogs);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching logs:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Memoized Calculations ---
  const dailyLog = useMemo(() => logs[formatDate(selectedDate)] || {
    bikeKm: 0, carKm: 0, busKm: 0, trainKm: 0, planeKm: 0, nonVegMeals: 0, packagedItems: 0, energyKwh: 0
  }, [logs, selectedDate]);

  const todaysFootprint = useMemo(() => calculateFootprint(dailyLog), [dailyLog]);

  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = formatDate(date);
      const dayLog = logs[dateString];
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: parseFloat(calculateFootprint(dayLog).toFixed(2)),
      };
    }).reverse();
  }, [logs]);

  const impactData = useMemo(() => {
      const allLogs = Object.values(logs);
      const totalFootprint = allLogs.reduce((sum, log) => sum + calculateFootprint(log), 0);
      const totalEnergy = allLogs.reduce((sum, log) => sum + (log.energyKwh || 0), 0);
      
      let greenStreak = 0;
      const sortedDates = Object.keys(logs).sort().reverse();
      let currentDate = new Date();
      if (sortedDates.length > 0) {
        for (let i = 0; i < sortedDates.length; i++) {
            const dateStr = formatDate(currentDate);
            if (logs[dateStr]) {
                greenStreak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
      }

      return {
          totalFootprint,
          totalEnergy,
          greenStreak,
      }
  }, [logs]);

  const coachTips = useMemo(() => {
      const recentLogs = weeklyData.map(d => logs[formatDate(new Date(new Date().setDate(new Date().getDate() - (6 - weeklyData.indexOf(d)))))]);
      const avgCarKm = recentLogs.reduce((sum, log) => sum + (log?.carKm || 0), 0) / 7;
      const avgNonVeg = recentLogs.reduce((sum, log) => sum + (log?.nonVegMeals || 0), 0) / 7;
      const avgEnergy = recentLogs.reduce((sum, log) => sum + (log?.energyKwh || 0), 0) / 7;
      const avgBike = recentLogs.reduce((sum, log) => sum + (log?.bikeKm || 0), 0) / 7;

      const tips = [];
      if (avgCarKm > 10) tips.push("Your car usage is a major factor. Try using public transport or biking for short trips.");
      if (avgNonVeg > 1) tips.push("Reducing non-veg meals is a powerful way to lower your footprint. Try a 'Meatless Monday'!");
      if (avgEnergy > 5) tips.push("Your energy consumption is high. Remember to switch off lights and unplug devices when not in use.");
      if (avgBike > 2) tips.push("Great job on biking frequently! Keep up the fantastic work, it makes a real difference.");
      if (tips.length === 0) tips.push("You're doing great! Keep logging your activities to find new ways to reduce your impact.");
      
      return tips;
  }, [logs, weeklyData]);


  // --- Data Handling Functions ---
  const handleLogChange = (field, value) => {
    const dateString = formatDate(selectedDate);
    const updatedLog = { ...dailyLog, [field]: value };
    setLogs(prevLogs => ({ ...prevLogs, [dateString]: updatedLog }));
  };

  const saveLog = async () => {
    if (!user) return;
    const dateString = formatDate(selectedDate);
    const logData = { ...dailyLog, userId: user.uid, lastUpdated: new Date() };
    try {
      const docRef = doc(db, "artifacts", appId, "users", user.uid, "userLogs", dateString);
      await setDoc(docRef, logData, { merge: true });
      setNotification("Log saved successfully!");
    } catch (error) {
      console.error("Error saving log:", error);
      setNotification("Failed to save log.");
    } finally {
        setTimeout(() => setNotification(''), 3000);
    }
  };

  const changeDate = (offset) => {
    setSelectedDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + offset);
        return newDate;
    });
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-green-50">Loading Carbon Quest...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-gray-50 to-green-50 p-4 font-sans">
      {notification && (
        <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-5 right-5 bg-green-600 text-white p-3 rounded-lg shadow-lg z-50"
        >
            {notification}
        </motion.div>
      )}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">🌍 Carbon Quest</h1>
      </header>

      <nav className="flex space-x-2 mb-6 bg-green-100/50 p-1 rounded-lg">
        {["dashboard", "log", "impact", "coach"].map((view) => (
          <Button key={view} variant={activeView === view ? "default" : "ghost"} onClick={() => setActiveView(view)} className="flex-1">
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </Button>
        ))}
      </nav>

      <main>
        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <DashboardCard title="Today's Footprint" value={`${todaysFootprint.toFixed(2)} kg CO₂`} icon={<Leaf className="h-5 w-5 text-green-600" />} />
                <DashboardCard title="Today's Energy" value={`${dailyLog.energyKwh} kWh`} icon={<Zap className="h-5 w-5 text-yellow-500" />} />
                <DashboardCard title="Transport" value={`${dailyLog.carKm + dailyLog.busKm + dailyLog.trainKm + dailyLog.bikeKm + dailyLog.planeKm} km`} icon={<Car className="h-5 w-5 text-blue-500" />} />
                <DashboardCard title="Diet" value={`${dailyLog.nonVegMeals} meals`} icon={<Drumstick className="h-5 w-5 text-red-500" />} />
              </div>
              <Card className="rounded-2xl shadow-lg">
                <CardHeader><CardTitle className="flex items-center space-x-2 text-gray-700"><LineChartIcon className="h-5 w-5" /><span>Weekly Carbon Trend (kg CO₂)</span></CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#22c55e" /></BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeView === "log" && (
            <motion.div key="log" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Log Habits</h2>
                <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm">
                    <Button onClick={() => changeDate(-1)} variant="ghost" size="icon"><ChevronLeft/></Button>
                    <span className="font-medium text-sm"><Calendar className="inline h-4 w-4 mr-1"/>{selectedDate.toLocaleDateString('en-CA')}</span>
                    <Button onClick={() => changeDate(1)} variant="ghost" size="icon"><ChevronRight/></Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberField icon={<Bike className="h-5 w-5 text-green-600" />} label="Bike distance" unit="km" value={dailyLog.bikeKm} onChange={(v) => handleLogChange('bikeKm', v)} />
                <NumberField icon={<Car className="h-5 w-5 text-blue-600" />} label="Car distance" unit="km" value={dailyLog.carKm} onChange={(v) => handleLogChange('carKm', v)} />
                <NumberField icon={<Bus className="h-5 w-5 text-yellow-600" />} label="Bus distance" unit="km" value={dailyLog.busKm} onChange={(v) => handleLogChange('busKm', v)} />
                <NumberField icon={<Train className="h-5 w-5 text-gray-600" />} label="Train distance" unit="km" value={dailyLog.trainKm} onChange={(v) => handleLogChange('trainKm', v)} />
                <NumberField icon={<Plane className="h-5 w-5 text-indigo-600" />} label="Flight distance" unit="km" value={dailyLog.planeKm} onChange={(v) => handleLogChange('planeKm', v)} />
                <NumberField icon={<Drumstick className="h-5 w-5 text-red-500" />} label="Non-veg meals" unit="meals" value={dailyLog.nonVegMeals} onChange={(v) => handleLogChange('nonVegMeals', v)} />
                <NumberField icon={<Package className="h-5 w-5 text-purple-500" />} label="Packaged items" unit="items" value={dailyLog.packagedItems} onChange={(v) => handleLogChange('packagedItems', v)} />
                <NumberField icon={<Zap className="h-5 w-5 text-yellow-500" />} label="Energy used" unit="kWh" value={dailyLog.energyKwh} onChange={(v) => handleLogChange('energyKwh', v)} />
              </div>
              <Button onClick={saveLog} className="w-full">Save Log for {selectedDate.toLocaleDateString('en-CA')}</Button>
            </motion.div>
          )}
          
          {activeView === "impact" && (
            <motion.div key="impact" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImpactCard icon={<Leaf className="h-6 w-6 text-green-500" />} title="Total Footprint" value={`${impactData.totalFootprint.toFixed(2)} kg CO₂`} subtitle="All-time calculated emissions" />
              <ImpactCard icon={<Zap className="h-6 w-6 text-yellow-500" />} title="Total Energy" value={`${impactData.totalEnergy.toFixed(2)} kWh`} subtitle="All-time energy consumption" />
              <ImpactCard icon={<Award className="h-6 w-6 text-blue-500" />} title="Green Streak" value={`${impactData.greenStreak} Days`} subtitle="Consecutive days logged" />
            </motion.div>
          )}

          {activeView === "coach" && (
            <motion.div key="coach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center space-x-2 text-gray-800">
                <Sparkles className="h-5 w-5 text-green-600" />
                <span>AI Eco Coach</span>
              </h2>
              <div className="p-4 rounded-2xl bg-white shadow-md space-y-3">
                <p className="text-sm font-medium">Based on your activity from the last 7 days, here are your personalized tips:</p>
                <ul className="list-disc pl-5 text-sm space-y-2 text-gray-600">
                  {coachTips.map((tip, index) => <li key={index}>{tip}</li>)}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
