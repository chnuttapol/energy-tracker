import React, { useState, useEffect } from 'react';
import { getAIAdvice, getBlessingMessage, extractEnergyBoosters } from './utils/aiAdvisor';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';

// Seed data helper
const INITIAL_LEADERS = ['boss@company.com', 'leader@company.com', 'admin@company.com'];

const INITIAL_MOCK_LOGS = [
  // Monday
  { id: '1', email: 'somchai@company.com', nickname: 'สมชาย', score: 85, reason: 'นอนเต็มอิ่ม 8 ชั่วโมง ตื่นมาสดชื่น ได้กาแฟดำหนึ่งแก้ว', timestamp: '2026-06-29T08:35:00.000Z', period: 'morning', status: 'on-time' },
  { id: '2', email: 'somchai@company.com', nickname: 'สมชาย', score: 90, reason: 'Morning Brief สนุกมาก เพื่อนร่วมทีมช่วยคิดไอเดีย มีพลังลุยต่อเลย บรีฟดีจริงๆ', timestamp: '2026-06-29T09:35:00.000Z', period: 'morning_brief', status: 'on-time' },
  { id: '3', email: 'somchai@company.com', nickname: 'สมชาย', score: 70, reason: 'กินข้าวกลางวันอิ่มมาก เริ่มง่วงนิดๆ แอร์ออฟฟิศเย็นฉ่ำ', timestamp: '2026-06-29T14:05:00.000Z', period: 'afternoon', status: 'on-time' },
  
  { id: '4', email: 'somsri@company.com', nickname: 'สมศรี', score: 40, reason: 'เมื่อคืนนอนดึก เพราะปั่นสไลด์พรีเซนต์ ลูกค้าเร่งส่งเช้านี้ เครียดจัดเลย', timestamp: '2026-06-29T08:38:00.000Z', period: 'morning', status: 'on-time' },
  { id: '5', email: 'somsri@company.com', nickname: 'สมศรี', score: 60, reason: 'Morning Brief สรุปงานชัดเจนขึ้น ทำให้กังวลเรื่องพรีเซนต์น้อยลง ดีขึ้นนิดนึงครับ', timestamp: '2026-06-29T09:37:00.000Z', period: 'morning_brief', status: 'on-time' },
  { id: '6', email: 'somsri@company.com', nickname: 'สมศรี', score: 75, reason: 'ได้กาแฟส้มช่วยชีวิตหลังมื้อเที่ยง สมองกลับมาแล่นพร้อมพรีเซนต์ละ', timestamp: '2026-06-29T14:15:00.000Z', period: 'afternoon', status: 'late' }, // Late

  { id: '7', email: 'kaew@company.com', nickname: 'แก้ว', score: 75, reason: 'ฟังเพลงคลาสสิกระหว่างนั่งรถไฟฟ้ามาทำงาน อารมณ์ดี สดใส', timestamp: '2026-06-29T08:32:00.000Z', period: 'morning', status: 'on-time' },
  { id: '8', email: 'kaew@company.com', nickname: 'แก้ว', score: 70, reason: 'บรีฟสั้นกระชับเข้าใจง่าย มีทิศทางทำงานวันนี้ชัดเจนดี', timestamp: '2026-06-29T09:36:00.000Z', period: 'morning_brief', status: 'on-time' },
  { id: '9', email: 'kaew@company.com', nickname: 'แก้ว', score: 80, reason: 'กินข้าวเที่ยงอร่อยมาก ส้มตำไก่ย่างเด็ดสุดๆ พลังเต็มถัง', timestamp: '2026-06-29T14:02:00.000Z', period: 'afternoon', status: 'on-time' },

  // Tuesday
  { id: '10', email: 'somchai@company.com', nickname: 'สมชาย', score: 80, reason: 'ออกกำลังกายตอนเช้า วิ่งรอบหมู่บ้าน 3 กิโล ปลอดโปร่ง', timestamp: '2026-06-30T08:34:00.000Z', period: 'morning', status: 'on-time' },
  { id: '11', email: 'somchai@company.com', nickname: 'สมชาย', score: 85, reason: 'คุยเล่นกับเพื่อนร่วมงาน แลกเปลี่ยนไอเดียฟีเจอร์ใหม่ แฮปปี้มาก', timestamp: '2026-06-30T09:38:00.000Z', period: 'morning_brief', status: 'on-time' },
  { id: '12', email: 'somchai@company.com', nickname: 'สมชาย', score: 65, reason: 'งานเยอะและค่อนข้างซับซ้อน เริ่มมึนหัวนิดๆ', timestamp: '2026-06-30T14:08:00.000Z', period: 'afternoon', status: 'on-time' },

  { id: '13', email: 'somsri@company.com', nickname: 'สมศรี', score: 70, reason: 'นอนหลับเต็มอิ่มขึ้น ไม่มีงานค้างจากเมื่อวาน เบาสบายตัว', timestamp: '2026-06-30T08:36:00.000Z', period: 'morning', status: 'on-time' },
  { id: '14', email: 'somsri@company.com', nickname: 'สมศรี', score: 85, reason: 'ได้แชร์งานเสร็จเรียบร้อยและได้รับคำชมในทีม มีกำลังใจมากๆ', timestamp: '2026-06-30T09:32:00.000Z', period: 'morning_brief', status: 'on-time' },
  { id: '15', email: 'somsri@company.com', nickname: 'สมศรี', score: 55, reason: 'ง่วงนอนยามบ่าย งานค่อนข้างนิ่งๆ น่าเบื่อนิดหน่อย', timestamp: '2026-06-30T14:20:00.000Z', period: 'afternoon', status: 'late' }, // Late

  { id: '16', email: 'kaew@company.com', nickname: 'แก้ว', score: 60, reason: 'ลืมร่มแล้วฝนตกตอนเดินเข้าออฟฟิศ เปียกซุยไปทั้งตัว แง', timestamp: '2026-06-30T08:45:00.000Z', period: 'morning', status: 'late' }, // Late
  { id: '17', email: 'kaew@company.com', nickname: 'แก้ว', score: 80, reason: 'หลังจากเปลี่ยนชุดแล้วได้คุยกับทีมใน Morning Brief ทุกคนแซวอย่างเป็นกันเอง ตลกดี หายเครียดเลย', timestamp: '2026-06-30T09:39:00.000Z', period: 'morning_brief', status: 'on-time' },
  { id: '18', email: 'kaew@company.com', nickname: 'แก้ว', score: 75, reason: 'ชาเขียวไข่มุกหวานร้อยเปรียบเหมือนยาวิเศษ พลังชีวิตกลับคืนมา', timestamp: '2026-06-30T14:03:00.000Z', period: 'afternoon', status: 'on-time' },
];

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState(null);

  // State for user session
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('energy_tracker_user');
    return saved ? JSON.parse(saved) : null;
  });

  // State for system logs
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('energy_tracker_logs');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('energy_tracker_logs', JSON.stringify(INITIAL_MOCK_LOGS));
    return INITIAL_MOCK_LOGS;
  });

  // State for leaders list
  const [leaders, setLeaders] = useState(() => {
    const saved = localStorage.getItem('energy_tracker_leaders');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('energy_tracker_leaders', JSON.stringify(INITIAL_LEADERS));
    return INITIAL_LEADERS;
  });

  // UI Navigation state
  const [activeTab, setActiveTab] = useState('checkin'); // checkin, history, leader
  
  // Login input states
  const [loginEmail, setLoginEmail] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [isNewUserRegistration, setIsNewUserRegistration] = useState(false);

  // Energy form inputs
  const [energyScore, setEnergyScore] = useState(70);
  const [energyReason, setEnergyReason] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('morning');

  // Time Mocking State for testing late features
  const [isTimeMocked, setIsTimeMocked] = useState(false);
  const [mockHour, setMockHour] = useState('08');
  const [mockMinute, setMockMinute] = useState('35');
  const [systemTimeStr, setSystemTimeStr] = useState('');

  // Submission Results Modal State
  const [submitResult, setSubmitResult] = useState(null); // null or { advice, blessing, isLate, score, period }

  // Assign Leader email input
  const [newLeaderEmail, setNewLeaderEmail] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Keep actual clock running when not mocked
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTimeMocked) {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        setSystemTimeStr(`${hrs}:${mins}`);
      } else {
        setSystemTimeStr(`${mockHour}:${mockMinute}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimeMocked, mockHour, mockMinute]);

  // Set default period based on time of day (real/mocked)
  useEffect(() => {
    if (!systemTimeStr) return;
    const [hrs, mins] = systemTimeStr.split(':').map(Number);
    const totalMins = hrs * 60 + mins;

    // 08:30 limit is 08:40, 09:40 is morning brief, 14:00 limit 14:10
    if (totalMins < 9 * 60 + 20) { // before 09:20
      setSelectedPeriod('morning');
    } else if (totalMins < 13 * 60) { // before 13:00
      setSelectedPeriod('morning_brief');
    } else {
      setSelectedPeriod('afternoon');
    }
  }, [systemTimeStr]);

  // Display a brief toast alert
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  // 1. Supabase Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSupabaseUser(session.user);
        syncUserAndLoadData(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSupabaseUser(session.user);
        syncUserAndLoadData(session.user);
      } else {
        setSupabaseUser(null);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserAndLoadData = async (sbUser) => {
    setIsLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .maybeSingle();

      if (profile) {
        const userObj = {
          id: sbUser.id,
          email: sbUser.email,
          nickname: profile.nickname,
          role: profile.role
        };
        setCurrentUser(userObj);
        localStorage.setItem('energy_tracker_user', JSON.stringify(userObj));
        
        await fetchSupabaseLogsAndLeaders();
        setIsNewUserRegistration(false);
      } else {
        // No profile found, redirect to nickname registration
        setLoginEmail(sbUser.email);
        setIsNewUserRegistration(true);
      }
    } catch (err) {
      console.error(err);
      triggerToast('เกิดข้อผิดพลาดในการโหลดข้อมูล Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupabaseLogsAndLeaders = async () => {
    if (!isSupabaseConfigured) return;
    try {
      // Fetch energy logs
      const { data: logsData, error: logsErr } = await supabase
        .from('energy_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!logsErr && logsData) {
        const formattedLogs = logsData.map(l => ({
          id: l.id,
          email: l.email,
          nickname: l.nickname,
          score: l.score,
          reason: l.reason,
          timestamp: l.created_at,
          period: l.period,
          status: l.status
        }));
        setLogs(formattedLogs);
        localStorage.setItem('energy_tracker_logs', JSON.stringify(formattedLogs));
      }

      // Fetch profiles with role === 'leader' to update leaders list
      const { data: leadersData, error: leadersErr } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'leader');

      if (!leadersErr && leadersData) {
        const leaderEmails = leadersData.map(l => l.email.toLowerCase());
        setLeaders(leaderEmails);
        localStorage.setItem('energy_tracker_leaders', JSON.stringify(leaderEmails));
      }
    } catch (err) {
      console.error('Error fetching logs/leaders:', err);
    }
  };

  // Check role whenever leader list updates (only in mock mode, supabase mode has role in profile table)
  useEffect(() => {
    if (currentUser && !isSupabaseConfigured) {
      const isLeader = leaders.includes(currentUser.email.toLowerCase());
      const newRole = isLeader ? 'leader' : 'employee';
      if (currentUser.role !== newRole) {
        const updated = { ...currentUser, role: newRole };
        setCurrentUser(updated);
        localStorage.setItem('energy_tracker_user', JSON.stringify(updated));
      }
    }
  }, [leaders, currentUser]);

  // Handle login submit (Mock or Supabase)
  const handleGoogleLogin = async (e, explicitEmail = '') => {
    if (e) e.preventDefault();
    const email = (explicitEmail || loginEmail).trim().toLowerCase();
    if (!email) {
      triggerToast('กรุณากรอกอีเมลเพื่อเข้าสู่ระบบ');
      return;
    }
    if (!email.includes('@')) {
      triggerToast('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    if (isSupabaseConfigured) {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      setIsLoading(true); // Keep loading shown to wait for session redirection
      setIsLoading(false);

      if (error) {
        console.error('Supabase OTP Error:', error);
        triggerToast('ไม่สามารถส่ง Magic Link ได้: ' + error.message);
      } else {
        triggerToast('ส่งลิงก์เข้าสู่ระบบไปยังอีเมลของคุณแล้ว! กรุณาตรวจสอบกล่องจดหมาย ✉️');
      }
    } else {
      // Local Mock Login logic
      const existingLogs = logs.filter(l => l.email === email);
      const isLeader = leaders.includes(email);
      const userRole = isLeader ? 'leader' : 'employee';

      if (existingLogs.length > 0) {
        const foundUser = {
          email,
          nickname: existingLogs[0].nickname,
          role: userRole
        };
        setCurrentUser(foundUser);
        localStorage.setItem('energy_tracker_user', JSON.stringify(foundUser));
        setLoginEmail('');
        triggerToast(`ยินดีต้อนรับกลับมาคุณ ${foundUser.nickname}!`);
      } else {
        // First-time registration flow
        setIsNewUserRegistration(true);
      }
    }
  };

  // Complete first-time registration with Nickname
  const handleRegisterNickname = async (e) => {
    e.preventDefault();
    const nickname = nicknameInput.trim();
    if (!nickname) {
      triggerToast('กรุณากรอกชื่อเล่นสำหรับแสดงผล');
      return;
    }

    const email = loginEmail.trim().toLowerCase();
    const isLeader = leaders.includes(email);
    const userRole = isLeader ? 'leader' : 'employee';

    if (isSupabaseConfigured && supabaseUser) {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: supabaseUser.id,
            email,
            nickname,
            role: userRole
          }
        ]);
      setIsLoading(false);

      if (error) {
        console.error('Supabase profile creation error:', error);
        triggerToast('ไม่สามารถสร้างโปรไฟล์ได้: ' + error.message);
        return;
      }

      const newUser = {
        id: supabaseUser.id,
        email,
        nickname,
        role: userRole
      };
      setCurrentUser(newUser);
      localStorage.setItem('energy_tracker_user', JSON.stringify(newUser));
      setIsNewUserRegistration(false);
      setNicknameInput('');
      fetchSupabaseLogsAndLeaders();
      triggerToast(`ยินดีต้อนรับสมาชิกใหม่ คุณ ${nickname}! 🎉`);
    } else {
      // Local Mock registration
      const newUser = {
        email,
        nickname,
        role: userRole
      };

      setCurrentUser(newUser);
      localStorage.setItem('energy_tracker_user', JSON.stringify(newUser));
      setIsNewUserRegistration(false);
      setLoginEmail('');
      setNicknameInput('');
      triggerToast(`ยินดีต้อนรับสมาชิกใหม่ คุณ ${nickname}! 🎉`);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      setIsLoading(true);
      await supabase.auth.signOut();
      setIsLoading(false);
    }
    setCurrentUser(null);
    localStorage.removeItem('energy_tracker_user');
    setActiveTab('checkin');
    triggerToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Determine if submission is late based on time constraints
  const checkIsLate = (period, timeStr) => {
    const [hrs, mins] = timeStr.split(':').map(Number);
    const timeVal = hrs * 60 + mins;

    if (period === 'morning') {
      // Limit is 8:40 (8 * 60 + 40 = 520)
      return timeVal > 8 * 60 + 40;
    } else if (period === 'morning_brief') {
      // Limit is 9:40 (9 * 60 + 40 = 580)
      return timeVal > 9 * 60 + 40;
    } else if (period === 'afternoon') {
      // Limit is 14:10 (14 * 60 + 10 = 850)
      return timeVal > 14 * 60 + 10;
    }
    return false;
  };

  // Submit Energy Rating
  const handleEnergySubmit = async (e) => {
    e.preventDefault();
    if (!energyReason.trim()) {
      triggerToast('กรุณากรอกเหตุผลก่อนส่งคะแนนครับ');
      return;
    }

    const timeStr = systemTimeStr;
    const isLate = checkIsLate(selectedPeriod, timeStr);
    
    // Fetch previous score in the morning (if checking morning brief)
    let prevScore = null;
    if (selectedPeriod === 'morning_brief') {
      const todayDate = new Date().toISOString().split('T')[0];
      const morningLog = logs.find(l => 
        l.email === currentUser.email && 
        l.period === 'morning' && 
        new Date(l.timestamp).toISOString().split('T')[0] === todayDate
      );
      if (morningLog) prevScore = morningLog.score;
    }

    const advice = getAIAdvice(energyScore, energyReason, currentUser.nickname, selectedPeriod, prevScore);
    const blessing = getBlessingMessage(energyScore);

    if (isSupabaseConfigured && currentUser.id) {
      setIsLoading(true);
      const { error } = await supabase
        .from('energy_logs')
        .insert([
          {
            user_id: currentUser.id,
            email: currentUser.email,
            nickname: currentUser.nickname,
            score: Number(energyScore),
            reason: energyReason.trim(),
            period: selectedPeriod,
            status: isLate ? 'late' : 'on-time'
          }
        ]);
      setIsLoading(false);

      if (error) {
        console.error('Supabase energy log insert error:', error);
        triggerToast('ไม่สามารถบันทึกพลังงานใน Supabase ได้: ' + error.message);
        return;
      }
      
      await fetchSupabaseLogsAndLeaders();
    } else {
      // Local Mock save
      const newLog = {
        id: String(Date.now()),
        email: currentUser.email,
        nickname: currentUser.nickname,
        score: Number(energyScore),
        reason: energyReason.trim(),
        timestamp: new Date().toISOString(),
        period: selectedPeriod,
        status: isLate ? 'late' : 'on-time'
      };

      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem('energy_tracker_logs', JSON.stringify(updatedLogs));
    }

    // Open Modal
    setSubmitResult({
      advice,
      blessing,
      isLate,
      score: energyScore,
      period: selectedPeriod
    });

    // Reset fields
    setEnergyReason('');
  };

  // Add a new Leader email
  const handleAddLeader = async (e) => {
    e.preventDefault();
    const email = newLeaderEmail.trim().toLowerCase();
    if (!email) return;
    if (leaders.includes(email)) {
      triggerToast('อีเมลนี้เป็นหัวหน้าทีมอยู่แล้ว');
      return;
    }

    if (isSupabaseConfigured) {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'leader' })
        .eq('email', email)
        .select();
      setIsLoading(false);

      if (error) {
        console.error('Supabase update leader role error:', error);
        triggerToast('ไม่สามารถแต่งตั้งได้: ' + error.message);
      } else if (!data || data.length === 0) {
        // If profile doesn't exist yet, save locally to pre-grant permission
        const updated = [...leaders, email];
        setLeaders(updated);
        localStorage.setItem('energy_tracker_leaders', JSON.stringify(updated));
        setNewLeaderEmail('');
        triggerToast(`ไม่พบโปรไฟล์ในฐานข้อมูลจริง แต่ออฟไลน์บันทึกสิทธิ์ล่วงหน้าให้คุณ ${email} แล้ว!`);
      } else {
        setNewLeaderEmail('');
        await fetchSupabaseLogsAndLeaders();
        triggerToast(`แต่งตั้งคุณ ${email} เป็น Leader บน Supabase เรียบร้อย!`);
      }
    } else {
      const updated = [...leaders, email];
      setLeaders(updated);
      localStorage.setItem('energy_tracker_leaders', JSON.stringify(updated));
      setNewLeaderEmail('');
      triggerToast(`แต่งตั้งคุณ ${email} เป็น Leader เรียบร้อย!`);
    }
  };

  // Remove a leader
  const handleRemoveLeader = async (email) => {
    if (email === currentUser.email) {
      triggerToast('คุณไม่สามารถถอดถอนสิทธิ์ Leader ของตนเองได้');
      return;
    }

    if (isSupabaseConfigured) {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'employee' })
        .eq('email', email);
      setIsLoading(false);

      if (error) {
        console.error('Supabase remove leader error:', error);
        triggerToast('ไม่สามารถถอดถอนสิทธิ์ได้: ' + error.message);
      } else {
        await fetchSupabaseLogsAndLeaders();
        triggerToast(`ถอดถอนสิทธิ์คุณ ${email} สำเร็จ`);
      }
    } else {
      const updated = leaders.filter(l => l !== email);
      setLeaders(updated);
      localStorage.setItem('energy_tracker_leaders', JSON.stringify(updated));
      triggerToast(`ถอดถอนสิทธิ์คุณ ${email} สำเร็จ`);
    }
  };

  // Color mapper based on score
  const getScoreColorClass = (score) => {
    if (score < 45) return 'var(--color-danger)';
    if (score > 75) return 'var(--color-success)';
    return 'var(--color-secondary)';
  };

  // --- Calculations for History Graph & Dashboard ---
  const myLogs = logs.filter(l => l.email === currentUser?.email);

  // Group team logs for insights
  const allBoosters = logs
    .filter(l => l.score > 75)
    .flatMap(l => extractEnergyBoosters(l.reason));
  
  // Frequency map for boosters
  const boosterCount = {};
  allBoosters.forEach(b => {
    boosterCount[b] = (boosterCount[b] || 0) + 1;
  });
  const sortedBoosters = Object.entries(boosterCount)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 5); // top 5

  // Calculations for Today's Stats
  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => new Date(l.timestamp).toISOString().split('T')[0] === today);
    
    if (todayLogs.length === 0) {
      return { min: '-', max: '-', avg: '-', penaltyCount: 0, complianceRate: '-', morningBriefImpact: null };
    }

    const scores = todayLogs.map(l => l.score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const penaltyCount = todayLogs.filter(l => l.status === 'late').length;
    
    // 1. Compliance rate (Discipline index)
    const complianceRate = Math.round((todayLogs.filter(l => l.status === 'on-time').length / todayLogs.length) * 100);

    // 2. Morning Brief Impact
    const morningLogs = todayLogs.filter(l => l.period === 'morning');
    const briefLogs = todayLogs.filter(l => l.period === 'morning_brief');
    
    let morningBriefImpact = null;
    if (morningLogs.length > 0 && briefLogs.length > 0) {
      const morningAvg = morningLogs.reduce((sum, l) => sum + l.score, 0) / morningLogs.length;
      const briefAvg = briefLogs.reduce((sum, l) => sum + l.score, 0) / briefLogs.length;
      morningBriefImpact = Number((briefAvg - morningAvg).toFixed(1));
    }

    return { min, max, avg, penaltyCount, complianceRate, morningBriefImpact };
  };

  const todayStats = getTodayStats();

  // 3. Find employees who need empathetic care (last 2 consecutive energy submissions are < 45)
  const getEmpatheticCareList = () => {
    const uniqueUserEmails = [...new Set(logs.map(l => l.email))];
    const list = [];
    
    uniqueUserEmails.forEach(email => {
      // Sort logs for this user descending by date
      const userLogs = [...logs]
        .filter(l => l.email === email)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
      if (userLogs.length >= 2) {
        const last = userLogs[0];
        const prev = userLogs[1];
        if (last.score < 45 && prev.score < 45) {
          list.push({
            email,
            nickname: last.nickname,
            lastScore: last.score,
            prevScore: prev.score,
            lastReason: last.reason,
            lastTime: new Date(last.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          });
        }
      } else if (userLogs.length === 1) {
        const last = userLogs[0];
        if (last.score < 30) {
          list.push({
            email,
            nickname: last.nickname,
            lastScore: last.score,
            prevScore: null,
            lastReason: last.reason,
            lastTime: new Date(last.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    });
    
    return list;
  };
  
  const careList = getEmpatheticCareList();
  return (
    <div className="app-container">
      {/* DB Connection Status Banner */}
      <div style={{
        textAlign: 'center',
        padding: '6px 12px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        background: isSupabaseConfigured ? 'rgba(0, 184, 148, 0.15)' : 'rgba(243, 156, 18, 0.15)',
        color: isSupabaseConfigured ? 'var(--color-success)' : 'var(--color-secondary)',
        borderBottom: `1px solid ${isSupabaseConfigured ? 'rgba(0, 184, 148, 0.2)' : 'rgba(243, 156, 18, 0.2)'}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '0 0 12px 12px',
        marginBottom: '15px'
      }}>
        <span>{isSupabaseConfigured ? '🟢 ออนไลน์ (เชื่อมต่อ Supabase แล้ว)' : '🟠 โหมดทดสอบจำลอง (Offline - บันทึกในบราวเซอร์)'}</span>
        {!isSupabaseConfigured && (
          <span style={{ fontWeight: 'normal', color: 'var(--color-text-muted)' }}>
            — คัดลอกค่า Env ใส่ไฟล์ .env.local เพื่อรันฐานข้อมูลจริง
          </span>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--color-primary-glow)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>กำลังโหลดข้อมูลกับ Supabase...</span>
        </div>
      )}

      {/* Toast Alert */}
      {toastMsg && <div className="toast-msg">{toastMsg}</div>}

      {/* HEADER SECTION (Logged In) */}
      {currentUser && (
        <header className="app-header">
          <div className="app-logo">
            <span>⚡</span> Energy Tracker
          </div>
          
          <nav className="nav-links">
            <button 
              className={`btn-nav ${activeTab === 'checkin' ? 'active' : ''}`}
              onClick={() => setActiveTab('checkin')}
            >
              เช็คพลังงาน
            </button>
            <button 
              className={`btn-nav ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              ประวัติของฉัน
            </button>
            {currentUser.role === 'leader' && (
              <button 
                className={`btn-nav ${activeTab === 'leader' ? 'active' : ''}`}
                onClick={() => setActiveTab('leader')}
              >
                Dashboard ทีม
              </button>
            )}
          </nav>

          <div className="user-badge">
            <div className="user-nickname">{currentUser.nickname}</div>
            <span className={`badge-role ${currentUser.role}`}>{currentUser.role === 'leader' ? 'หัวหน้า' : 'พนักงาน'}</span>
            <button className="btn-logout" onClick={handleLogout}>ออก</button>
          </div>
        </header>
      )}

      {/* LOGIN & SIGN IN SCREEN */}
      {!currentUser && !isNewUserRegistration && (
        <main className="glass-card login-container">
          <div className="login-icon">⚡</div>
          <h1 className="login-title">Energy Tracker</h1>
          <p className="login-subtitle">
            เช็คพลังงานกายและใจวันละ 3 รอบ เพื่อให้เราเท่าทันสติ มีความสุข และพร้อมทำงานอย่างมีประสิทธิภาพในทุกๆ วัน
          </p>

          <form onSubmit={handleGoogleLogin} style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-login">อีเมล Google สำหรับทดลองใช้งาน:</label>
              <input 
                id="email-login"
                type="email"
                className="form-input"
                placeholder="เช่น boss@company.com หรือ yourname@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn-google">
              {/* Google SVG Icon */}
              <svg viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.5 15.02.75 12 .75 7.37.75 3.39 3.42 1.5 7.28l3.89 3.01C6.3 7.33 8.94 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.44c-.28 1.48-1.12 2.73-2.37 3.57l3.7 2.87c2.16-1.99 3.72-4.91 3.72-8.6z"/>
                <path fill="#FBBC05" d="M5.39 10.29C5.15 11.59 5.02 12.92 5.02 14c0 1.08.13 2.41.37 3.71l-3.89 3.01c-.91-1.83-1.42-3.86-1.42-6.72s.51-4.89 1.42-6.72l3.89 3.01z"/>
                <path fill="#34A853" d="M12 23.25c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.1.74-2.5 1.18-4.26 1.18-3.06 0-5.7-2.29-6.61-5.25l-3.89 3.01c1.89 3.86 5.87 6.84 10.5 6.84z"/>
              </svg>
              เข้าสู่ระบบจำลองบัญชี Google
            </button>
          </form>

          {/* Quick Mock Accounts Picker */}
          <div className="google-mock-users">
            <div className="mock-user-title">เลือกรุ่นบัญชีเพื่อทดสอบระบบได้ทันที:</div>
            <div className="mock-user-list">
              <button className="btn-mock-user" onClick={() => handleGoogleLogin(null, 'boss@company.com')}>
                <span>👨‍💼 <strong>boss@company.com</strong> (มีสิทธิ์ดู Dashboard ทีม)</span>
                <span className="status-badge on-time">Leader</span>
              </button>
              <button className="btn-mock-user" onClick={() => handleGoogleLogin(null, 'somchai@company.com')}>
                <span>🧑‍💻 <strong>somchai@company.com</strong> (พนักงาน - มีข้อมูลประวัติ)</span>
                <span className="status-badge" style={{ background: '#ECEFF1', color: '#546E7A' }}>Employee</span>
              </button>
              <button className="btn-mock-user" onClick={() => handleGoogleLogin(null, 'kaew@company.com')}>
                <span>👩‍🎨 <strong>kaew@company.com</strong> (พนักงาน - มีประวัติและส่งสาย)</span>
                <span className="status-badge" style={{ background: '#ECEFF1', color: '#546E7A' }}>Employee</span>
              </button>
              <button className="btn-mock-user" onClick={() => handleGoogleLogin(null, 'newbie@company.com')}>
                <span>🆕 <strong>newbie@company.com</strong> (พนักงานใหม่ - สมัครครั้งแรก)</span>
                <span className="status-badge" style={{ background: '#E8F5E9', color: '#2E7D32' }}>New User</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* FIRST-TIME REGISTER NICKNAME SCREEN */}
      {!currentUser && isNewUserRegistration && (
        <main className="glass-card register-container">
          <h2 style={{ marginBottom: '12px', fontSize: '1.6rem' }}>ยินดีต้อนรับเข้าสู่ระบบครั้งแรก! 😊</h2>
          <p className="login-subtitle">ระบบจำเป็นต้องขอชื่อเล่นของคุณ เพื่อแสดงผลข้อความอย่างเป็นกันเองและเป็นมิตรครับ</p>
          
          <form onSubmit={handleRegisterNickname}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-nickname">กรอกชื่อเล่นของคุณ:</label>
              <input 
                id="reg-nickname"
                type="text"
                className="form-input"
                placeholder="เช่น สมชาย, โบว์, แอน"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={20}
                required
                autoFocus
              />
            </div>
            
            <button type="submit" className="btn-submit">ยืนยันข้อมูลและเริ่มใช้ระบบ</button>
          </form>
        </main>
      )}

      {/* CORE SCREENS FOR LOGGED IN USERS */}
      {currentUser && (
        <main>
          {/* TAB 1: CHECK-IN SCREEN */}
          {activeTab === 'checkin' && !submitResult && (
            <div className="glass-card" style={{ marginTop: '0' }}>
              
              {/* SYSTEM RULES & TIME SLOTS DISPLAY */}
              <div className="rules-container">
                <h3 className="rules-title">⏰ กติกาการวัดพลังงานในทีมประจำวัน</h3>
                <div className="time-slots">
                  <div className={`time-slot ${selectedPeriod === 'morning' ? 'active' : ''}`}>
                    <div className="time-slot-label">🌅 รอบเช้าเริ่มงาน</div>
                    <div className="time-slot-val">08:30 น.</div>
                    <div className="time-slot-limit">(ส่งไม่เกิน 08:40 น.)</div>
                  </div>
                  <div className={`time-slot ${selectedPeriod === 'morning_brief' ? 'active' : ''}`}>
                    <div className="time-slot-label">📢 หลัง Morning Brief</div>
                    <div className="time-slot-val">หลังบรีฟ</div>
                    <div className="time-slot-limit">(ส่งไม่เกิน 09:40 น.)</div>
                  </div>
                  <div className={`time-slot ${selectedPeriod === 'afternoon' ? 'active' : ''}`}>
                    <div className="time-slot-label">🍛 หลังข้าวเที่ยง</div>
                    <div className="time-slot-val">14:00 น.</div>
                    <div className="time-slot-limit">(ส่งไม่เกิน 14:10 น.)</div>
                  </div>
                </div>
              </div>

              {/* CLOCK & TIME MOCKING FOR TESTING */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong>เวลาในระบบขณะนี้:</strong> <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.2rem', color: 'var(--color-primary)' }}>{systemTimeStr} น.</span>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isTimeMocked} 
                      onChange={(e) => setIsTimeMocked(e.target.checked)} 
                    />
                    ⚙️ จำลองเวลาเพื่อกดทดสอบส่งสาย
                  </label>
                  {isTimeMocked && (
                    <div style={{ display: 'flex', gap: '5px', marginTop: '6px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={mockHour} 
                        onChange={(e) => setMockHour(e.target.value.slice(0, 2))} 
                        style={{ width: '35px', padding: '2px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
                      /> : 
                      <input 
                        type="text" 
                        value={mockMinute} 
                        onChange={(e) => setMockMinute(e.target.value.slice(0, 2))} 
                        style={{ width: '35px', padding: '2px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
                      /> น.
                      <button 
                        onClick={() => { setMockHour('08'); setMockMinute('35'); }} 
                        style={{ fontSize: '0.75rem', padding: '2px 5px', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#ccc' }}
                      >
                        เช้า (ตรงเวลา)
                      </button>
                      <button 
                        onClick={() => { setMockHour('08'); setMockMinute('48'); }} 
                        style={{ fontSize: '0.75rem', padding: '2px 5px', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#ccc' }}
                      >
                        เช้า (สาย)
                      </button>
                      <button 
                        onClick={() => { setMockHour('14'); setMockMinute('25'); }} 
                        style={{ fontSize: '0.75rem', padding: '2px 5px', cursor: 'pointer', borderRadius: '4px', border: 'none', background: '#ccc' }}
                      >
                        บ่าย (สาย)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CHECK-IN FORM */}
              <form onSubmit={handleEnergySubmit}>
                <div className="checkin-header">
                  <h2>วันนี้พลังงานกายและใจเป็นอย่างไรบ้าง?</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>มาประเมินตัวเองเพื่อรักษาสติพร้อมสำหรับการเริ่มงานกันนะครับ</p>
                </div>

                <div className="form-group" style={{ textAlign: 'center' }}>
                  <label className="form-label">รอบเวลาที่ต้องการรายงาน:</label>
                  <div className="time-period-selector">
                    <button 
                      type="button" 
                      className={`period-pill ${selectedPeriod === 'morning' ? 'selected' : ''}`}
                      onClick={() => setSelectedPeriod('morning')}
                    >
                      🌅 เช้าเริ่มงาน (08:30)
                    </button>
                    <button 
                      type="button" 
                      className={`period-pill ${selectedPeriod === 'morning_brief' ? 'selected' : ''}`}
                      onClick={() => setSelectedPeriod('morning_brief')}
                    >
                      📢 หลัง Morning Brief
                    </button>
                    <button 
                      type="button" 
                      className={`period-pill ${selectedPeriod === 'afternoon' ? 'selected' : ''}`}
                      onClick={() => setSelectedPeriod('afternoon')}
                    >
                      🍛 บ่ายทำงาน (14:00)
                    </button>
                  </div>
                </div>

                {/* Energy Slider */}
                <div className="energy-slider-container">
                  <div className="energy-display-box">
                    <span 
                      className="energy-number" 
                      style={{ color: getScoreColorClass(energyScore) }}
                    >
                      {energyScore}
                    </span>
                    <span 
                      className="energy-label"
                      style={{ color: getScoreColorClass(energyScore) }}
                    >
                      {energyScore < 45 ? '⚡ พลังงานต่ำ (เหนื่อยล้า / ต้องการชาร์จพลัง)' : 
                       energyScore > 75 ? '⚡ พลังงานเต็มถัง! (พร้อมลุยล้านเปอร์เซ็นต์)' : 
                       '⚡ พลังงานปานกลาง (มีสติ บาลานซ์กำลังดี)'}
                    </span>
                  </div>

                  <div className="slider-wrapper">
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={energyScore}
                      className="energy-slider"
                      style={{ 
                        background: `linear-gradient(to right, 
                          var(--color-danger) 0%, 
                          var(--color-secondary) 50%, 
                          var(--color-success) 100%)` 
                      }}
                      onChange={(e) => setEnergyScore(Number(e.target.value))}
                    />
                    <div className="slider-labels">
                      <span>0 (หมดพลังงาน)</span>
                      <span>50 (ทรงตัว)</span>
                      <span>100 (ล้นเปี่ยม)</span>
                    </div>
                  </div>
                </div>

                {/* Reason Textbox */}
                <div className="form-group">
                  <label className="form-label" htmlFor="energy-reason">
                    ทำไมคุณให้คะแนนพลังงานเท่านี้? <span style={{ color: 'var(--color-danger)' }}>*จำเป็นต้องกรอก</span>
                  </label>
                  <textarea 
                    id="energy-reason"
                    className="form-input"
                    rows="3"
                    placeholder="ใส่เหตุผลสั้นๆ เช่น ได้ดื่มกาแฟแก้วโปรด, เมื่อคืนนอนดึกเคลียร์ซีรีส์, รู้สึกหัวหน้าบรีฟกระชับดีมีไฟ ฯลฯ"
                    value={energyReason}
                    onChange={(e) => setEnergyReason(e.target.value)}
                    maxLength={200}
                    required
                  ></textarea>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {energyReason.length}/200 ตัวอักษร
                  </div>
                </div>

                <button type="submit" className="btn-submit">
                  🚀 บันทึกคะแนนและส่งพลังงาน
                </button>
              </form>
            </div>
          )}

          {/* TAB 1 SUBMISSION RESULT SCREEN (Feedback & Penalty Animation) */}
          {activeTab === 'checkin' && submitResult && (
            <div className="glass-card text-center" style={{ marginTop: '0', textAlign: 'center' }}>
              
              {/* COMPLIMENT OR LATE ANIMATION */}
              {submitResult.isLate ? (
                <div className="penalty-container">
                  <div className="penalty-badge">⏱️ ส่งล่าช้ากว่าที่กำหนด!</div>
                  
                  {/* CSS Piggy Bank Animation */}
                  <div className="piggy-bank-anim">
                    <svg viewBox="0 0 200 200" width="100%" height="100%">
                      <circle cx="100" cy="40" r="15" className="piggy-coin" />
                      <g transform="translate(0, 20)">
                        {/* Piggy body */}
                        <ellipse cx="100" cy="110" rx="65" ry="50" className="piggy-body" />
                        {/* Legs */}
                        <rect x="60" y="145" width="20" height="30" rx="5" className="piggy-body" />
                        <rect x="120" y="145" width="20" height="30" rx="5" className="piggy-body" />
                        {/* Ears */}
                        <polygon points="50,70 70,50 80,75" className="piggy-ear" />
                        <polygon points="150,70 130,50 120,75" className="piggy-ear" />
                        {/* Nose */}
                        <ellipse cx="165" cy="110" rx="12" ry="18" className="piggy-body" />
                        <circle cx="161" cy="105" r="3" className="piggy-features" />
                        <circle cx="167" cy="105" r="3" className="piggy-features" />
                        {/* Eyes */}
                        <circle cx="130" cy="95" r="4" className="piggy-features" />
                        {/* Tail */}
                        <path d="M35 110 Q 20 100 25 90 Q 30 80 40 90" fill="none" stroke="#e07293" strokeWidth="4" strokeLinecap="round" />
                      </g>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-danger)', marginBottom: '8px' }}>หยอดกระปุกลงโทษ 20 บาท ด่วนน้า!</h3>
                  <p className="penalty-text" style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                    รอบนี้คุณส่งคะแนนช้าเกินขอบเขตที่กำหนด แต่ไม่เป็นไรนะ กองทุนความสุขของออฟฟิศยินดีต้อนรับเหรียญของคุณ! 🐷💸
                  </p>
                </div>
              ) : (
                <div>
                  <div className="success-anim">👏</div>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--color-success)', marginBottom: '10px' }}>เยี่ยมมาก! ส่งคะแนนตรงเวลาสำเร็จ</h3>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>คุณรักษาวินัยการมีสติและรายงานพลังงานได้ตรงเวลาดีเยี่ยมเลยครับ!</p>
                </div>
              )}

              {/* AI Advice Card */}
              <div className={`ai-feedback-card ${submitResult.advice.type}`}>
                <h4 className="ai-feedback-title">
                  <span>🤖</span> {submitResult.advice.title}
                </h4>
                <p className="ai-feedback-text">{submitResult.advice.text}</p>
              </div>

              {/* Blessing Message */}
              <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: '24px 0', color: 'var(--color-text-dark)' }}>
                {submitResult.blessing}
              </p>

              <button 
                type="button" 
                className="btn-submit"
                style={{ maxWidth: '200px', margin: '0 auto' }}
                onClick={() => setSubmitResult(null)}
              >
                เสร็จสิ้น 💚
              </button>
            </div>
          )}

          {/* TAB 2: PERSONAL HISTORY SCREEN */}
          {activeTab === 'history' && (
            <div className="glass-card" style={{ marginTop: '0' }}>
              <div className="history-header">
                <h2>ประวัติพลังงานย้อนหลังของคุณ</h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  ส่งทั้งหมดแล้ว <strong>{myLogs.length} รอบ</strong> | ตรงเวลา <strong>{myLogs.filter(l=>l.status === 'on-time').length}</strong> รอบ
                </div>
              </div>

              {/* Render custom SVG Graph of user scores */}
              {myLogs.length > 0 ? (
                <div className="graph-container">
                  <h3 className="graph-title">📈 แนวโน้มพลังงานของคุณล่าสุด (เรียงตามรอบการบันทึก)</h3>
                  <div className="svg-wrapper">
                    <svg viewBox="0 0 600 200" className="svg-chart">
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="580" y2="20" className="chart-grid" />
                      <line x1="40" y1="60" x2="580" y2="60" className="chart-grid" />
                      <line x1="40" y1="100" x2="580" y2="100" className="chart-grid" />
                      <line x1="40" y1="140" x2="580" y2="140" className="chart-grid" />
                      <line x1="40" y1="180" x2="580" y2="180" className="chart-grid" />

                      {/* Y-axis Labels */}
                      <text x="30" y="24" className="chart-text y-axis">100</text>
                      <text x="30" y="104" className="chart-text y-axis">50</text>
                      <text x="30" y="184" className="chart-text y-axis">0</text>

                      {/* Plot Data Lines */}
                      {(() => {
                        // Take up to last 10 points for visibility
                        const pointsToPlot = [...myLogs].reverse().slice(-10);
                        if (pointsToPlot.length === 0) return null;
                        
                        const width = 540;
                        const spacing = pointsToPlot.length > 1 ? width / (pointsToPlot.length - 1) : width;
                        
                        // Map coordinates (x, y)
                        // x: 40 + i * spacing
                        // y: 180 - (score / 100) * 160
                        const coords = pointsToPlot.map((pt, i) => {
                          const x = 40 + (pointsToPlot.length > 1 ? i * spacing : width / 2);
                          const y = 180 - (pt.score / 100) * 160;
                          return { x, y, score: pt.score, label: pt.period === 'morning' ? 'เช้า' : pt.period === 'morning_brief' ? 'บรีฟ' : 'บ่าย' };
                        });

                        // Path string
                        let pathD = `M ${coords[0].x} ${coords[0].y}`;
                        for (let i = 1; i < coords.length; i++) {
                          pathD += ` L ${coords[i].x} ${coords[i].y}`;
                        }

                        return (
                          <>
                            {/* Draw Line */}
                            {coords.length > 1 && <path d={pathD} className="chart-line" />}
                            
                            {/* Draw Dots and Labels */}
                            {coords.map((pt, idx) => (
                              <g key={idx}>
                                <circle cx={pt.x} cy={pt.y} r="6" className="chart-dots" />
                                <text x={pt.x} y={pt.y - 12} className="chart-text" style={{ fontWeight: '700', fill: 'var(--color-primary)' }}>
                                  {pt.score}
                                </text>
                                <text x={pt.x} y="196" className="chart-text">
                                  {pt.label}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                  ไม่มีข้อมูลประวัติพลังงานของคุณในขณะนี้ ส่งแบบฟอร์มเพื่อเริ่มบันทึกข้อมูลครับ!
                </div>
              )}

              {/* Table list of my logs */}
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>วัน/เวลา</th>
                      <th>รอบ</th>
                      <th>คะแนน</th>
                      <th>เหตุผล</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleDateString('th-TH')} {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</td>
                        <td>
                          {log.period === 'morning' ? '🌅 เช้าเริ่มงาน' : 
                           log.period === 'morning_brief' ? '📢 หลัง Morning Brief' : 
                           '🍛 หลังข้าวเที่ยง'}
                        </td>
                        <td>
                          <span 
                            className="score-badge"
                            style={{ 
                              background: getScoreColorClass(log.score) + '22',
                              color: getScoreColorClass(log.score)
                            }}
                          >
                            {log.score}
                          </span>
                        </td>
                        <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>{log.reason}</td>
                        <td>
                          <span className={`status-badge ${log.status}`}>
                            {log.status === 'on-time' ? 'ตรงเวลา' : 'ส่งช้า (ปรับ 20บ.)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myLogs.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>ยังไม่พบประวัติการกรอก</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LEADER DASHBOARD SCREEN */}
          {activeTab === 'leader' && currentUser.role === 'leader' && (
            <div className="glass-card" style={{ marginTop: '0' }}>
              <h2 style={{ marginBottom: '6px' }}>📊 แดชบอร์ดสรุปพลังงานทีม (สำหรับหัวหน้าเท่านั้น)</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                ข้อมูลเหตุผลเบื้องหลังของพนักงานทุกคนจะแสดงผลในหน้านี้อย่างปลอดภัย และไม่เผยแพร่ต่อพนักงานคนอื่นๆ
              </p>

              {/* Team Stats Cards */}
              <div className="leader-grid">
                <div className="stat-card">
                  <div className="stat-label">⚡ เฉลี่ยพลังงานทีมวันนี้</div>
                  <div className="stat-value avg">{todayStats.avg !== '-' ? `${todayStats.avg}/100` : '-'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">📈 พลังงานสูงสุดวันนี้</div>
                  <div className="stat-value max">{todayStats.max}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">📉 พลังงานต่ำสุดวันนี้</div>
                  <div className="stat-value min">{todayStats.min}</div>
                </div>
                <div className="stat-card" style={{ background: '#FFF2F2', borderColor: '#FFC8C8' }}>
                  <div className="stat-label" style={{ color: 'var(--color-danger)' }}>💸 เงินค่าปรับวันนี้</div>
                  <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{todayStats.penaltyCount * 20} บาท</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>จากคนส่งช้า {todayStats.penaltyCount} คน</div>
                </div>
                <div className="stat-card" style={{ background: '#F0FFF4', borderColor: '#C6F6D5' }}>
                  <div className="stat-label" style={{ color: 'var(--color-success)' }}>🎯 อัตราส่งตรงเวลาวันนี้</div>
                  <div className="stat-value" style={{ color: 'var(--color-success)' }}>{todayStats.complianceRate !== '-' ? `${todayStats.complianceRate}%` : '-'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>เป้าหมายของทีม: 90%+</div>
                </div>
                <div className="stat-card" style={{ 
                  background: todayStats.morningBriefImpact > 0 ? '#F0FFF4' : todayStats.morningBriefImpact < 0 ? '#FFF5F5' : '#F7FAFC', 
                  borderColor: todayStats.morningBriefImpact > 0 ? '#C6F6D5' : todayStats.morningBriefImpact < 0 ? '#FED7D7' : '#E2E8F0' 
                }}>
                  <div className="stat-label">📢 ดัชนีกระตุ้นพลัง Brief</div>
                  <div className="stat-value" style={{ 
                    color: todayStats.morningBriefImpact > 0 ? 'var(--color-success)' : todayStats.morningBriefImpact < 0 ? 'var(--color-danger)' : 'var(--color-text-dark)' 
                  }}>
                    {todayStats.morningBriefImpact !== null ? (todayStats.morningBriefImpact > 0 ? `+${todayStats.morningBriefImpact}` : todayStats.morningBriefImpact) : '-'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>เทียบก่อน-หลัง Morning Brief</div>
                </div>
              </div>

              {/* Empathetic Care Alerts */}
              {careList.length > 0 && (
                <div className="ai-feedback-card low" style={{ borderLeftWidth: '6px', textAlign: 'left', marginBottom: '24px' }}>
                  <h3 style={{ color: 'var(--color-danger)', fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🚨 ระบบตรวจพบพนักงานต้องการการซัพพอร์ตด่วน! ({careList.length} คน)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', marginBottom: '12px' }}>
                    มีคนในทีมที่พลังงานต่ำติดต่อกัน หรือมีสัญญาณเหนื่อยล้าผิดปกติ แนะนำให้หัวหน้าพูดคุย 1-on-1 หรือชวนคุยดูแลใจนะครับ:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {careList.map(item => (
                      <div key={item.email} style={{ background: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,118,117,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-danger)' }}>
                          <span>🧑‍💻 คุณ{item.nickname} ({item.email})</span>
                          <span>รอบล่าสุด: {item.lastScore}/100 {item.prevScore !== null ? `(รอบก่อน: ${item.prevScore})` : ''}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          เหตุผลล่าสุด: "{item.lastReason}" ({item.lastTime} น.)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly team graph */}
              <div className="graph-container">
                <h3 className="graph-title">📈 สถิติเฉลี่ยพลังงานของทีมจำแนกตามช่วงเวลาในสัปดาห์นี้</h3>
                <div className="svg-wrapper">
                  <svg viewBox="0 0 600 220" className="svg-chart">
                    {/* Grid lines */}
                    <line x1="50" y1="20" x2="580" y2="20" className="chart-grid" />
                    <line x1="50" y1="60" x2="580" y2="60" className="chart-grid" />
                    <line x1="50" y1="100" x2="580" y2="100" className="chart-grid" />
                    <line x1="50" y1="140" x2="580" y2="140" className="chart-grid" />
                    <line x1="50" y1="180" x2="580" y2="180" className="chart-grid" />

                    {/* Y-axis */}
                    <text x="35" y="24" className="chart-text y-axis">100</text>
                    <text x="35" y="104" className="chart-text y-axis">50</text>
                    <text x="35" y="184" className="chart-text y-axis">0</text>

                    {/* Plot team trends: Mon, Tue (From simulated mock logs) */}
                    {(() => {
                      const days = ['จันทร์', 'อังคาร'];
                      const data = [
                        // Monday stats
                        { x: 180, morning: 66, brief: 73, afternoon: 75 },
                        // Tuesday stats
                        { x: 420, morning: 70, brief: 82, afternoon: 65 }
                      ];

                      return (
                        <>
                          {/* Lines */}
                          <path d="M 180 74 L 420 68" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray="3 3" />
                          <path d="M 180 63 L 420 48" fill="none" stroke="var(--color-success)" strokeWidth="4" />
                          <path d="M 180 60 L 420 76" fill="none" stroke="var(--color-info)" strokeWidth="3" strokeDasharray="5 2" />

                          {/* Data points */}
                          {data.map((day, i) => (
                            <g key={i}>
                              {/* Morning point */}
                              <circle cx={day.x} cy={180 - (day.morning / 100) * 160} r="5" fill="var(--color-primary)" />
                              <text x={day.x - 20} y={180 - (day.morning / 100) * 160 + 4} className="chart-text" style={{ fontSize: '10px' }}>{day.morning}</text>

                              {/* Brief point */}
                              <circle cx={day.x} cy={180 - (day.brief / 100) * 160} r="6" fill="var(--color-success)" />
                              <text x={day.x} y={180 - (day.brief / 100) * 160 - 8} className="chart-text" style={{ fontSize: '10px', fontWeight: '700' }}>{day.brief}</text>

                              {/* Afternoon point */}
                              <circle cx={day.x} cy={180 - (day.afternoon / 100) * 160} r="5" fill="var(--color-info)" />
                              <text x={day.x + 20} y={180 - (day.afternoon / 100) * 160 + 4} className="chart-text" style={{ fontSize: '10px' }}>{day.afternoon}</text>

                              {/* Day Label */}
                              <text x={day.x} y="205" className="chart-text" style={{ fontWeight: '700', fontSize: '12px' }}>{days[i]}</text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                
                {/* Legend */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.8rem', marginTop: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--color-primary)', borderRadius: '50%' }}></span> รอบเช้าเริ่มงาน
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--color-success)', borderRadius: '50%' }}></span> หลัง Morning Brief (เส้นทึบ)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--color-info)', borderRadius: '50%' }}></span> หลังข้าวเที่ยง
                  </span>
                </div>
              </div>

              {/* Team Energy Boosters (AI insights) */}
              <div className="insights-card">
                <h3 className="insights-title">💡 ปัจจัยหลักที่ทำให้พลังงานของคนในทีมบวกวันนี้ (คะแนนระดับ 75 ขึ้นไป)</h3>
                {sortedBoosters.length > 0 ? (
                  <div className="insight-tags">
                    {sortedBoosters.map((booster, idx) => (
                      <span key={idx} className="insight-tag">{booster}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>ยังไม่พบข้อมูลคำสำคัญที่มีนัยสำคัญ</p>
                )}
              </div>
              {/* Today's Employee Status Cards */}
              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>🔍 สถานะพลังงานพนักงานรายบุคคลวันนี้</h3>
              <div className="employee-status-grid">
                {(() => {
                  const uniqueEmails = [...new Set(logs.map(l => l.email))];
                  const today = new Date().toISOString().split('T')[0];
                  
                  return uniqueEmails.map(email => {
                    const userLogs = logs.filter(l => l.email === email);
                    const nickname = userLogs[0]?.nickname || email.split('@')[0];
                    
                    const todayUserLogs = userLogs.filter(l => 
                      new Date(l.timestamp).toISOString().split('T')[0] === today
                    );
                    
                    const morningLog = todayUserLogs.find(l => l.period === 'morning');
                    const briefLog = todayUserLogs.find(l => l.period === 'morning_brief');
                    const afternoonLog = todayUserLogs.find(l => l.period === 'afternoon');
                    
                    const renderRoundStatus = (label, log) => {
                      if (log) {
                        return (
                          <div className="round-status-box" style={{ borderLeft: `4px solid ${getScoreColorClass(log.score)}` }}>
                            <div className="round-status-header">
                              <span className="round-label-text">{label}</span>
                              <span className={`status-badge ${log.status}`}>
                                {log.status === 'on-time' ? 'ตรงเวลา' : 'ส่งช้า'}
                              </span>
                            </div>
                            <div className="round-status-body" style={{ fontSize: '0.85rem', margin: '4px 0' }}>
                              ระดับพลังงาน: <strong style={{ color: getScoreColorClass(log.score) }}>{log.score}</strong>/100
                            </div>
                            <div className="round-reason-bubble">
                              "{log.reason}"
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="round-not-submitted">
                            ⚪ {label}: ยังไม่บันทึก
                          </div>
                        );
                      }
                    };

                    return (
                      <div key={email} className="employee-card">
                        <div className="employee-card-header">
                          <div className="employee-card-avatar">
                            {nickname.slice(0, 1)}
                          </div>
                          <div>
                            <div className="employee-card-name">{nickname}</div>
                            <div className="employee-card-email">{email}</div>
                          </div>
                        </div>
                        <div className="employee-card-rounds">
                          {renderRoundStatus('🌅 เช้าเริ่มงาน', morningLog)}
                          {renderRoundStatus('📢 หลัง Morning Brief', briefLog)}
                          {renderRoundStatus('🍛 หลังข้าวเที่ยง', afternoonLog)}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Confidential team log table */}
              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>📋 ข้อมูลบันทึกพลังงานของพนักงานทั้งหมดในทีม</h3>
              <div className="table-wrapper" style={{ marginBottom: '30px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ชื่อเล่น</th>
                      <th>รอบเวลา</th>
                      <th>คะแนน</th>
                      <th>เหตุผลส่วนตัว (ความลับ)</th>
                      <th>เวลาที่ส่งจริง</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td><strong>{log.nickname}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>({log.email})</span></td>
                        <td>
                          {log.period === 'morning' ? '🌅 เช้าเริ่มงาน' : 
                           log.period === 'morning_brief' ? '📢 หลัง Morning Brief' : 
                           '🍛 หลังข้าวเที่ยง'}
                        </td>
                        <td>
                          <span 
                            className="score-badge"
                            style={{ 
                              background: getScoreColorClass(log.score) + '22',
                              color: getScoreColorClass(log.score)
                            }}
                          >
                            {log.score}
                          </span>
                        </td>
                        <td style={{ maxWidth: '280px', wordBreak: 'break-word', fontStyle: 'italic' }}>"{log.reason}"</td>
                        <td>{new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</td>
                        <td>
                          <span className={`status-badge ${log.status}`}>
                            {log.status === 'on-time' ? 'ตรงเวลา' : 'ช้า (หยอด 20บ.)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>ไม่มีสถิติบันทึกในระบบ</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Setting UI to assign leaders */}
              <div className="assign-leader-section">
                <h3 className="assign-leader-title">⚙️ จัดการสิทธิ์การเข้าถึง Dashboard ทีม (แต่งตั้ง Leader)</h3>
                
                <form onSubmit={handleAddLeader} className="assign-leader-form">
                  <input 
                    type="email"
                    className="form-input"
                    placeholder="ใส่อีเมล Google ที่ต้องการตั้งเป็น Leader เช่น helper@company.com"
                    value={newLeaderEmail}
                    onChange={(e) => setNewLeaderEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-submit" style={{ flexGrow: 0, padding: '0 20px', width: 'auto' }}>
                    แต่งตั้ง
                  </button>
                </form>

                <div className="leader-list">
                  {leaders.map((leaderEmail) => (
                    <span key={leaderEmail} className="leader-tag">
                      {leaderEmail}
                      <button 
                        type="button" 
                        className="btn-remove-leader"
                        onClick={() => handleRemoveLeader(leaderEmail)}
                        title="ถอดถอนสิทธิ์"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}
        </main>
      )}

      {/* Footer System Intro */}
      <footer style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '20px 0', marginTop: '20px' }}>
        Energy Tracker Project © 2026 • รักษาสุขภาวะกายใจ มีสติพร้อมลุยงาน ⚡
      </footer>
    </div>
  );
}

export default App;
