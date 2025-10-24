import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Music, Instagram, Youtube, Twitter, MessageCircle, ExternalLink, Clock, MapPin, LogOut, Plus, Edit, Trash2, Save, X } from 'lucide-react';

export default function MiraishiWebsite() {
  const [scrollY, setScrollY] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(9);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [ytApiKey, setYtApiKey] = useState('');
  const [ytChannelId, setYtChannelId] = useState('');
  const [ytLoading, setYtLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY || 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const scheduleData = await window.storage.get('miraishi-schedule');
      if (scheduleData && scheduleData.value) {
        setSchedule(JSON.parse(scheduleData.value));
      } else {
        const defaultSchedule = [
          { id: '1', date: '15 Nov 2025', time: '19:00 WIB', event: 'Miraishi 1st Anniversary Concert', venue: 'Jakarta Convention Center', type: 'Live Concert', status: 'Tickets Available', day: 15, month: 10, year: 2025 },
          { id: '2', date: '22 Nov 2025', time: '14:00 WIB', event: 'Meet & Greet Session', venue: 'Grand Indonesia, Jakarta', type: 'Fan Meeting', status: 'Registration Open', day: 22, month: 10, year: 2025 }
        ];
        setSchedule(defaultSchedule);
        await window.storage.set('miraishi-schedule', JSON.stringify(defaultSchedule));
      }

      const membersData = await window.storage.get('miraishi-members');
      if (membersData && membersData.value) {
        setMembers(JSON.parse(membersData.value));
      } else {
        const defaultMembers = [
          { id: '1', name: 'Aiko', role: 'Leader & Main Vocalist', color: 'from-pink-400 to-rose-500', photoUrl: '' },
          { id: '2', name: 'Yuki', role: 'Lead Vocalist', color: 'from-blue-400 to-cyan-500', photoUrl: '' },
          { id: '3', name: 'Hana', role: 'Main Dancer', color: 'from-purple-400 to-fuchsia-500', photoUrl: '' },
          { id: '4', name: 'Sora', role: 'Rapper & Producer', color: 'from-amber-400 to-orange-500', photoUrl: '' },
          { id: '5', name: 'Mika', role: 'Visual & Sub Vocalist', color: 'from-emerald-400 to-teal-500', photoUrl: '' }
        ];
        setMembers(defaultMembers);
        await window.storage.set('miraishi-members', JSON.stringify(defaultMembers));
      }

      const ytSettings = await window.storage.get('miraishi-yt-settings');
      if (ytSettings && ytSettings.value) {
        const settings = JSON.parse(ytSettings.value);
        setYtApiKey(settings.apiKey || '');
        setYtChannelId(settings.channelId || '');
        if (settings.apiKey && settings.channelId) {
          fetchYouTubeVideos(settings.apiKey, settings.channelId);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const fetchYouTubeVideos = async (apiKey, channelId) => {
    if (!apiKey || !channelId) return;
    
    setYtLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=3&type=video`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube videos');
      }
      
      const data = await response.json();
      const videos = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt
      }));
      
      setYoutubeVideos(videos);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      alert('Failed to fetch YouTube videos. Check your API key and Channel ID.');
    }
    setYtLoading(false);
  };

  const saveYouTubeSettings = async () => {
    try {
      await window.storage.set('miraishi-yt-settings', JSON.stringify({
        apiKey: ytApiKey,
        channelId: ytChannelId
      }));
      fetchYouTubeVideos(ytApiKey, ytChannelId);
      alert('YouTube settings saved!');
    } catch (error) {
      console.error('Error saving YouTube settings:', error);
      alert('Failed to save YouTube settings');
    }
  };

  const handleLogin = () => {
    if (loginPassword === 'miraishi2024') {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginPassword('');
    }
  };

  const handleLogoPress = () => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 2000);
    setLongPressTimer(timer);
  };

  const handleLogoRelease = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleSaveEvent = async () => {
    if (editingEvent) {
      const existing = schedule.find(e => e.id === editingEvent.id);
      const newSchedule = existing ? schedule.map(e => e.id === editingEvent.id ? editingEvent : e) : [...schedule, editingEvent];
      await window.storage.set('miraishi-schedule', JSON.stringify(newSchedule));
      setSchedule(newSchedule);
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Hapus event ini?')) {
      const newSchedule = schedule.filter(e => e.id !== id);
      await window.storage.set('miraishi-schedule', JSON.stringify(newSchedule));
      setSchedule(newSchedule);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember({...member});
  };

  const handleSaveMember = async () => {
    if (editingMember) {
      const newMembers = members.map(m => m.id === editingMember.id ? editingMember : m);
      await window.storage.set('miraishi-members', JSON.stringify(newMembers));
      setMembers(newMembers);
      setEditingMember(null);
    }
  };

  const handleCalendarDayClick = (day) => {
    const event = schedule.find(e => e.day === day && e.month === selectedMonth && e.year === selectedYear);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50">
        <div className="text-center">
          <div className="relative mb-8 w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-5xl">M</span>
            </div>
          </div>
          <div className="text-6xl font-black mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent animate-pulse">
            MIRAISHI
          </div>
          <div className="text-gray-600 text-lg mb-4">未来志</div>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-fuchsia-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900">
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="px-6 py-3 bg-violet-600 text-white rounded-full font-semibold shadow-lg hover:bg-violet-700 transition">
            {showAdminPanel ? 'Close' : 'Admin Panel'}
          </button>
          <button onClick={() => setIsAdmin(false)} className="px-6 py-3 bg-gray-800 text-white rounded-full font-semibold shadow-lg hover:bg-gray-700 transition">
            <LogOut className="w-4 h-4 inline mr-2" />Logout
          </button>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Admin Login</h3>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} placeholder="Password" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-violet-500" />
            <div className="flex gap-3">
              <button onClick={handleLogin} className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition">Login</button>
              <button onClick={() => setShowLogin(false)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Password: miraishi2024</p>
          </div>
        </div>
      )}

      {showAdminPanel && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-white">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black">Admin Panel</h2>
              <button onClick={() => setShowAdminPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">Manage Members</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${member.color} flex items-center justify-center overflow-hidden`}>
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-2xl font-bold">{member.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{member.name}</h4>
                        <p className="text-gray-600 text-sm">{member.role}</p>
                      </div>
                    </div>
                    <button onClick={() => handleEditMember(member)} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Manage Schedule</h3>
                <button onClick={() => setEditingEvent({ id: Date.now().toString(), date: '', time: '', event: '', venue: '', type: 'Live Concert', status: 'Coming Soon', day: 1, month: 10, year: 2025 })} className="px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition">
                  <Plus className="w-5 h-5 inline mr-2" />Add Event
                </button>
              </div>
              <div className="space-y-4">
                {schedule.map((event) => (
                  <div key={event.id} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold mb-2">{event.event}</h4>
                      <p className="text-gray-600">{event.date} - {event.time}</p>
                      <p className="text-gray-600">{event.venue}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingEvent({...event})} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">YouTube Settings</h3>
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">YouTube API Key</label>
                    <input
                      type="text"
                      value={ytApiKey}
                      onChange={(e) => setYtApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get it from: console.cloud.google.com</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Channel ID</label>
                    <input
                      type="text"
                      value={ytChannelId}
                      onChange={(e) => setYtChannelId(e.target.value)}
                      placeholder="UC..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Find it in your YouTube channel URL</p>
                  </div>
                  <button
                    onClick={saveYouTubeSettings}
                    className="px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save & Fetch Videos
                  </button>
                </div>
                {ytLoading && <p className="text-gray-600 mt-4">Loading videos...</p>}
                {youtubeVideos.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-green-600 mb-2">Successfully fetched {youtubeVideos.length} videos!</p>
                    <div className="space-y-2">
                      {youtubeVideos.map(video => (
                        <div key={video.id} className="text-xs text-gray-600">
                          {video.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6">Edit Event</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Event Name" value={editingEvent.event} onChange={(e) => setEditingEvent({...editingEvent, event: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Date" value={editingEvent.date} onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})} className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
                <input type="text" placeholder="Time" value={editingEvent.time} onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})} className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
              </div>
              <input type="text" placeholder="Venue" value={editingEvent.venue} onChange={(e) => setEditingEvent({...editingEvent, venue: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
              <div className="grid grid-cols-3 gap-4">
                <input type="number" placeholder="Day" min="1" max="31" value={editingEvent.day} onChange={(e) => setEditingEvent({...editingEvent, day: parseInt(e.target.value) || 1})} className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
                <input type="number" placeholder="Month (0-11)" min="0" max="11" value={editingEvent.month} onChange={(e) => setEditingEvent({...editingEvent, month: parseInt(e.target.value) || 0})} className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
                <input type="number" placeholder="Year" value={editingEvent.year} onChange={(e) => setEditingEvent({...editingEvent, year: parseInt(e.target.value) || 2025})} className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEvent} className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition">Save</button>
              <button onClick={() => setEditingEvent(null)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Edit Member</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Name" value={editingMember.name} onChange={(e) => setEditingMember({...editingMember, name: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
              <input type="text" placeholder="Role" value={editingMember.role} onChange={(e) => setEditingMember({...editingMember, role: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
              <input type="text" placeholder="Photo URL" value={editingMember.photoUrl || ''} onChange={(e) => setEditingMember({...editingMember, photoUrl: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500" />
              <p className="text-xs text-gray-500">Paste image URL from Imgur, Google Drive, etc</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveMember} className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition">Save</button>
              <button onClick={() => setEditingMember(null)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl font-bold text-gray-900">{selectedEvent.event}</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full uppercase">{selectedEvent.type}</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${selectedEvent.status === 'Tickets Available' ? 'bg-green-100 text-green-700' : selectedEvent.status === 'Registration Open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{selectedEvent.status}</span>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <span className="font-semibold">{selectedEvent.date}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-violet-600" />
                  <span className="font-semibold">{selectedEvent.time}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-violet-600" />
                  <span className="font-semibold">{selectedEvent.venue}</span>
                </div>
              </div>
              <div className="pt-6">
                <button className="w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-full hover:scale-105 transition-transform shadow-lg">
                  Get Tickets / Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer select-none"
              onMouseDown={handleLogoPress}
              onMouseUp={handleLogoRelease}
              onMouseLeave={handleLogoRelease}
              onTouchStart={handleLogoPress}
              onTouchEnd={handleLogoRelease}
              onTouchCancel={handleLogoRelease}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <div className="font-bold text-lg">MIRAISHI</div>
                <div className="text-xs text-gray-500">未来志</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-sm font-medium hover:text-violet-600 transition">Home</a>
              <a href="#about" className="text-sm font-medium hover:text-violet-600 transition">About</a>
              <a href="#members" className="text-sm font-medium hover:text-violet-600 transition">Members</a>
              <a href="#music" className="text-sm font-medium hover:text-violet-600 transition">Music</a>
              <a href="#schedule" className="text-sm font-medium hover:text-violet-600 transition">Schedule</a>
              <a href="#contact" className="text-sm font-medium hover:text-violet-600 transition">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50" style={{ transform: `translateY(${scrollY * 0.5}px)` }} />
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold rounded-full">✨ Indie Idol Project from Indonesia</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">MIRAISHI</h1>
            <div className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">未来志</div>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 italic">Tekad untuk Masa Depan</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a href="#music" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-2">
                <Music className="w-5 h-5" /><span>Listen to Our Music</span>
              </a>
              <a href="#schedule" className="px-8 py-4 border-2 border-violet-600 text-violet-600 font-semibold rounded-full hover:bg-violet-50 transition-all flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" /><span>Check Schedule</span>
              </a>
            </div>
            <div className="flex justify-center items-center space-x-6 mb-12">
              <a href="https://youtube.com/@miraishi" className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"><Youtube className="w-6 h-6" /></a>
              <a href="https://instagram.com/miraishi" className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"><Instagram className="w-6 h-6" /></a>
              <a href="https://twitter.com/miraishi" className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"><Twitter className="w-6 h-6" /></a>
              <a href="https://tiktok.com/@miraishi" className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"><MessageCircle className="w-6 h-6" /></a>
            </div>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-400 rounded-3xl shadow-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <Youtube className="w-24 h-24 mx-auto mb-6" />
                <div className="text-2xl font-bold mb-2">Latest Music Video</div>
                <div className="text-lg">Nami no Aida - 波の間</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">About Miraishi</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p><strong className="text-gray-900">Miraishi (未来志)</strong> adalah gabungan dari dua kata dalam bahasa Jepang yang penuh makna:</p>
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 p-6 rounded-2xl space-y-3">
                <p><span className="font-bold text-violet-600">未来 (Mirai)</span> = Masa depan</p>
                <p><span className="font-bold text-fuchsia-600">志 (Shi)</span> = Tekad, niat, keinginan</p>
              </div>
              <p>Miraishi berarti <em className="text-violet-600 font-semibold">"tekad untuk masa depan"</em>. Kami hadir untuk menemani setiap perjalanan kalian menuju mimpi!</p>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <span className="font-semibold text-gray-900">Debut: 27 Oktober 2024</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-fuchsia-600" />
                  <span className="font-semibold text-gray-900">Festival Anime Music Japan</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 aspect-video bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-2xl shadow-xl flex items-center justify-center"><span className="text-8xl">未来志</span></div>
              <div className="aspect-square bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl shadow-xl flex items-center justify-center"><span className="text-5xl">🎵</span></div>
              <div className="aspect-square bg-gradient-to-br from-violet-400 to-purple-400 rounded-2xl shadow-xl flex items-center justify-center"><span className="text-5xl">✨</span></div>
            </div>
          </div>
          <div className="mt-24 grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-10 rounded-3xl text-white shadow-2xl">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-3xl font-bold mb-4">Visi</h3>
              <p className="text-lg leading-relaxed opacity-95">Menjadikan Miraishi sebagai wadah untuk menampung kreativitas untuk semua membernya, dan karyanya diterima oleh masyarakat luas.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-10 rounded-3xl text-white shadow-2xl">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-3xl font-bold mb-4">Misi</h3>
              <p className="text-lg leading-relaxed opacity-95">Memperkenalkan Miraishi kepada khalayak umum dengan terjun ke event-event, serta menciptakan Idol baru dengan konsep yang unik sehingga menjadi idol go internasional.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="members" className="py-24 px-6 bg-gradient-to-b from-violet-50 to-fuchsia-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Meet the Members</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">5 talented individuals with one dream</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {members.map((member) => (
              <div key={member.id} className="group">
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                  <div className={`aspect-square bg-gradient-to-br ${member.color} relative overflow-hidden flex items-center justify-center`}>
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white text-6xl font-bold opacity-20">{member.name[0]}</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-6 text-center bg-white">
                    <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="music" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Our Music</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto" />
          </div>
          
          {youtubeVideos.length > 0 && (
            <div className="mb-16">
              <h3 className="text-4xl md:text-6xl font-black mb-8 text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                LIVE PERFORMANCES
              </h3>
              <div className="space-y-8">
                {youtubeVideos.map((video) => (
                  <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-xl">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50">
                      <h4 className="font-bold text-xl text-gray-900 mb-2">{video.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(video.publishedAt).toLocaleDateString('id-ID', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">DEBUT SINGLE</div>
                <h3 className="text-6xl font-black mb-4">Nami no Aida</h3>
                <div className="text-3xl mb-6 opacity-90">波の間</div>
                <p className="text-lg mb-8 opacity-90 leading-relaxed">Lagu debut yang menggambarkan perjalanan di tengah gelombang kehidupan. Dengan melodi yang menyentuh dan lirik yang penuh makna.</p>
                <div className="flex flex-wrap gap-4">
                  <a href="https://youtube.com/@miraishi" className="px-8 py-4 bg-white text-violet-600 font-semibold rounded-full hover:scale-105 transition-transform shadow-lg flex items-center space-x-2">
                    <Youtube className="w-5 h-5" /><span>Watch MV</span>
                  </a>
                  <button className="px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 font-semibold rounded-full transition flex items-center space-x-2">
                    <Music className="w-5 h-5" /><span>Spotify</span>
                  </button>
                </div>
              </div>
              <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-9xl mb-4">🌊</div>
                  <div className="text-sm tracking-widest opacity-75">DEBUT 2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="schedule" className="py-24 px-6 bg-gradient-to-b from-violet-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Event Calendar</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Jangan sampai ketinggalan acara kami!</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => selectedMonth === 0 ? (setSelectedMonth(11), setSelectedYear(selectedYear - 1)) : setSelectedMonth(selectedMonth - 1)} className="px-4 py-2 bg-violet-100 text-violet-600 rounded-lg hover:bg-violet-200 transition font-medium">← Prev</button>
              <h3 className="text-3xl font-bold">{monthNames[selectedMonth]} {selectedYear}</h3>
              <button onClick={() => selectedMonth === 11 ? (setSelectedMonth(0), setSelectedYear(selectedYear + 1)) : setSelectedMonth(selectedMonth + 1)} className="px-4 py-2 bg-violet-100 text-violet-600 rounded-lg hover:bg-violet-200 transition font-medium">Next →</button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-bold text-gray-600 py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const event = schedule.find(e => e.day === day && e.month === selectedMonth && e.year === selectedYear);
                return (
                  <div 
                    key={day}
                    onClick={() => handleCalendarDayClick(day)}
                    className={`aspect-square flex items-center justify-center rounded-xl font-semibold transition-all cursor-pointer ${event ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg scale-105 hover:scale-110' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-6">
            {schedule.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 border-l-4 border-violet-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full uppercase">{item.type}</span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.status === 'Tickets Available' ? 'bg-green-100 text-green-700' : item.status === 'Registration Open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.event}</h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{item.venue}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-full hover:scale-105 transition-transform shadow-lg flex items-center space-x-2">
                      <span>More Info</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-4">Get in Touch</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto mb-8" />
          <p className="text-gray-600 text-lg mb-16 max-w-2xl mx-auto">Untuk kolaborasi, booking event, atau sekadar ingin berbagi cerita, kami selalu terbuka!</p>
          <div className="grid md:grid-cols-2 gap-8">
            <a href="mailto:contact@miraishi.id" className="group bg-gradient-to-br from-violet-500 to-fuchsia-500 p-10 rounded-3xl text-white hover:scale-105 transition-transform shadow-2xl">
              <Mail className="w-12 h-12 mx-auto mb-6" />
              <div className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-90">Email Us</div>
              <div className="text-xl font-bold break-all">contact@miraishi.id</div>
            </a>
            <a href="https://wa.me/6289533568095" target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-br from-pink-500 to-rose-500 p-10 rounded-3xl text-white hover:scale-105 transition-transform shadow-2xl">
              <Phone className="w-12 h-12 mx-auto mb-6" />
              <div className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-90">WhatsApp</div>
              <div className="text-xl font-bold">+62 895-3356-8095</div>
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">M</span>
                </div>
                <div>
                  <div className="font-bold text-xl">MIRAISHI</div>
                  <div className="text-sm text-gray-400">未来志</div>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">Menemani setiap perjalanan menuju mimpimu dengan musik, semangat, dan kreativitas tanpa batas.</p>
              <div className="flex space-x-4">
                <a href="https://youtube.com/@miraishi" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/miraishi" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://twitter.com/miraishi" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#about" className="block hover:text-white transition">About</a>
                <a href="#members" className="block hover:text-white transition">Members</a>
                <a href="#music" className="block hover:text-white transition">Music</a>
                <a href="#schedule" className="block hover:text-white transition">Schedule</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>contact@miraishi.id</p>
                <p>+62 895-3356-8095</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2024-2025 Miraishi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}