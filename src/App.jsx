import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Users, Link as LinkIcon, Check, X } from 'lucide-react';

const RecurringMeetingScheduler = () => {
  const [view, setView] = useState('home'); // home, setup, participate, results
  const [meetingId, setMeetingId] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const [participants, setParticipants] = useState([]);
  
  // Participant form state
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedTimes, setSelectedTimes] = useState({});
  
  // Setup form state
  const [meetingTitle, setMeetingTitle] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weeksOfMonth = ['1st', '2nd', '3rd', '4th', '5th'];
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

  // Load meeting data and participants
  useEffect(() => {
    const loadData = async () => {
      if (!meetingId) return;
      
      try {
        const meetingResult = await window.storage.get(`meeting:${meetingId}`, true);
        if (meetingResult) {
          setMeetingData(JSON.parse(meetingResult.value));
        }
        
        const participantsResult = await window.storage.get(`participants:${meetingId}`, true);
        if (participantsResult) {
          setParticipants(JSON.parse(participantsResult.value));
        }
      } catch (error) {
        console.log('Meeting not found or error loading:', error);
      }
    };
    
    loadData();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [meetingId]);

  // Create new meeting
  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) return;
    
    const newMeetingId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const meeting = {
      id: newMeetingId,
      title: meetingTitle,
      organizerEmail,
      createdAt: new Date().toISOString()
    };
    
    try {
      await window.storage.set(`meeting:${newMeetingId}`, JSON.stringify(meeting), true);
      await window.storage.set(`participants:${newMeetingId}`, JSON.stringify([]), true);
      
      setMeetingId(newMeetingId);
      setMeetingData(meeting);
      setView('results');
    } catch (error) {
      alert('Failed to create meeting. Please try again.');
    }
  };

  // Join existing meeting
  const handleJoinMeeting = (id) => {
    setMeetingId(id);
    setView('participate');
  };

  // Toggle day-week slot selection
  const toggleSlot = (day, week) => {
    const key = `${week}-${day}`;
    setSelectedSlots(prev => {
      const newSlots = { ...prev };
      if (newSlots[key]) {
        delete newSlots[key];
        setSelectedTimes(prevTimes => {
          const newTimes = { ...prevTimes };
          delete newTimes[key];
          return newTimes;
        });
      } else {
        newSlots[key] = true;
      }
      return newSlots;
    });
  };

  // Toggle time selection for a slot
  const toggleTime = (slotKey, time) => {
    setSelectedTimes(prev => {
      const newTimes = { ...prev };
      if (!newTimes[slotKey]) {
        newTimes[slotKey] = [];
      }
      
      if (newTimes[slotKey].includes(time)) {
        newTimes[slotKey] = newTimes[slotKey].filter(t => t !== time);
      } else {
        newTimes[slotKey] = [...newTimes[slotKey], time];
      }
      
      return newTimes;
    });
  };

  // Submit participant availability
  const handleSubmitAvailability = async () => {
    if (!participantName.trim() || !participantEmail.trim()) {
      alert('Please enter your name and email');
      return;
    }
    
    if (Object.keys(selectedSlots).length === 0) {
      alert('Please select at least one day/week combination');
      return;
    }

    const participant = {
      name: participantName,
      email: participantEmail,
      availability: selectedTimes,
      submittedAt: new Date().toISOString()
    };

    try {
      const currentParticipants = [...participants, participant];
      await window.storage.set(`participants:${meetingId}`, JSON.stringify(currentParticipants), true);
      setParticipants(currentParticipants);
      
      setView('results');
      setParticipantName('');
      setParticipantEmail('');
      setSelectedSlots({});
      setSelectedTimes({});
    } catch (error) {
      alert('Failed to submit availability. Please try again.');
    }
  };

  // Calculate availability summary
  const getAvailabilitySummary = () => {
    const summary = {};
    
    participants.forEach(participant => {
      Object.entries(participant.availability).forEach(([slotKey, times]) => {
        if (!summary[slotKey]) {
          summary[slotKey] = { count: 0, times: {} };
        }
        summary[slotKey].count++;
        
        times.forEach(time => {
          if (!summary[slotKey].times[time]) {
            summary[slotKey].times[time] = [];
          }
          summary[slotKey].times[time].push(participant.name);
        });
      });
    });
    
    return summary;
  };

  // Copy link to clipboard
  const copyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?meeting=${meetingId}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  // Parse URL for meeting ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('meeting');
    if (id) {
      setMeetingId(id);
      setView('participate');
    }
  }, []);

  // Home View
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-6xl font-bold mb-4 text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Recurring
            </h1>
            <p className="text-xl text-slate-600" style={{ fontFamily: 'Lora, serif' }}>
              Schedule monthly meetings with ease
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-12 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-3" style={{ fontFamily: 'Lora, serif' }}>
                Meeting Title
              </label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Monthly Team Sync"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                style={{ fontFamily: 'Lora, serif' }}
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-3" style={{ fontFamily: 'Lora, serif' }}>
                Your Email (Optional)
              </label>
              <input
                type="email"
                value={organizerEmail}
                onChange={(e) => setOrganizerEmail(e.target.value)}
                placeholder="organizer@example.com"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                style={{ fontFamily: 'Lora, serif' }}
              />
            </div>

            <button
              onClick={handleCreateMeeting}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
              style={{ fontFamily: 'Lora, serif' }}
            >
              Create Meeting
            </button>
          </div>

          <div className="text-center text-slate-500 animate-fade-in" style={{ animationDelay: '0.4s', fontFamily: 'Lora, serif' }}>
            <p className="text-sm">
              Find the perfect recurring time slot for your monthly meetings
            </p>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:wght@400;500;600&display=swap');
          
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slide-up {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .animate-slide-up {
            animation: slide-up 0.8s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  // Participate View
  if (view === 'participate') {
    if (!meetingData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-slate-600" style={{ fontFamily: 'Lora, serif' }}>Loading meeting...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-3 text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              {meetingData.title}
            </h1>
            <p className="text-lg text-slate-600" style={{ fontFamily: 'Lora, serif' }}>
              Select your recurring monthly availability
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-10 mb-8">
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3" style={{ fontFamily: 'Lora, serif' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                  style={{ fontFamily: 'Lora, serif' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3" style={{ fontFamily: 'Lora, serif' }}>
                  Your Email
                </label>
                <input
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                  style={{ fontFamily: 'Lora, serif' }}
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                Step 1: Select Day & Week Combinations
              </h2>
              <p className="text-sm text-slate-600 mb-6" style={{ fontFamily: 'Lora, serif' }}>
                Click the boxes for the day-week combinations you're available (e.g., "1st Monday")
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-slate-200 p-3 bg-slate-50" style={{ fontFamily: 'Lora, serif' }}></th>
                      {daysOfWeek.map(day => (
                        <th key={day} className="border-2 border-slate-200 p-3 bg-slate-50 text-sm font-medium text-slate-700" style={{ fontFamily: 'Lora, serif' }}>
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeksOfMonth.map(week => (
                      <tr key={week}>
                        <td className="border-2 border-slate-200 p-3 bg-slate-50 font-medium text-slate-700" style={{ fontFamily: 'Lora, serif' }}>
                          {week}
                        </td>
                        {daysOfWeek.map(day => {
                          const key = `${week}-${day}`;
                          const isSelected = selectedSlots[key];
                          return (
                            <td key={key} className="border-2 border-slate-200 p-0">
                              <button
                                onClick={() => toggleSlot(day, week)}
                                className={`w-full h-16 transition-all hover:scale-95 ${
                                  isSelected 
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' 
                                    : 'bg-white hover:bg-amber-50'
                                }`}
                              >
                                {isSelected && <Check className="w-5 h-5 mx-auto" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {Object.keys(selectedSlots).length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Step 2: Select Available Times
                </h2>
                <p className="text-sm text-slate-600 mb-6" style={{ fontFamily: 'Lora, serif' }}>
                  For each selected day, choose the times you're available
                </p>

                {Object.keys(selectedSlots).map(slotKey => {
                  const [week, day] = slotKey.split('-');
                  return (
                    <div key={slotKey} className="mb-6 p-6 bg-slate-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-slate-800" style={{ fontFamily: 'Lora, serif' }}>
                        {week} {day} of each month
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots.map(time => {
                          const isSelected = selectedTimes[slotKey]?.includes(time);
                          return (
                            <button
                              key={time}
                              onClick={() => toggleTime(slotKey, time)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-amber-500'
                              }`}
                              style={{ fontFamily: 'Lora, serif' }}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setView('results')}
                className="flex-1 border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                style={{ fontFamily: 'Lora, serif' }}
              >
                View Results
              </button>
              <button
                onClick={handleSubmitAvailability}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
                style={{ fontFamily: 'Lora, serif' }}
              >
                Submit Availability
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:wght@400;500;600&display=swap');
        `}</style>
      </div>
    );
  }

  // Results View
  if (view === 'results') {
    if (!meetingData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-slate-600" style={{ fontFamily: 'Lora, serif' }}>Loading meeting...</div>
          </div>
        </div>
      );
    }

    const summary = getAvailabilitySummary();
    const maxCount = Math.max(...Object.values(summary).map(s => s.count), 1);

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-3 text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              {meetingData.title}
            </h1>
            <p className="text-lg text-slate-600 mb-6" style={{ fontFamily: 'Lora, serif' }}>
              {participants.length} {participants.length === 1 ? 'person has' : 'people have'} responded
            </p>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 bg-white border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all shadow-md"
                style={{ fontFamily: 'Lora, serif' }}
              >
                <LinkIcon className="w-5 h-5" />
                Copy Invite Link
              </button>
              <button
                onClick={() => setView('participate')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
                style={{ fontFamily: 'Lora, serif' }}
              >
                <Users className="w-5 h-5" />
                Add Your Availability
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-10 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Availability Overview
            </h2>

            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-2 border-slate-200 p-3 bg-slate-50" style={{ fontFamily: 'Lora, serif' }}></th>
                    {daysOfWeek.map(day => (
                      <th key={day} className="border-2 border-slate-200 p-3 bg-slate-50 text-sm font-medium text-slate-700" style={{ fontFamily: 'Lora, serif' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeksOfMonth.map(week => (
                    <tr key={week}>
                      <td className="border-2 border-slate-200 p-3 bg-slate-50 font-medium text-slate-700" style={{ fontFamily: 'Lora, serif' }}>
                        {week}
                      </td>
                      {daysOfWeek.map(day => {
                        const key = `${week}-${day}`;
                        const count = summary[key]?.count || 0;
                        const opacity = count / maxCount;
                        
                        return (
                          <td key={key} className="border-2 border-slate-200 p-0">
                            <div
                              className="h-16 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                              style={{
                                backgroundColor: count > 0 
                                  ? `rgba(217, 119, 6, ${0.2 + opacity * 0.8})` 
                                  : 'white'
                              }}
                              title={count > 0 ? `${count} available` : 'No availability'}
                            >
                              {count > 0 && (
                                <div className="text-white font-bold text-lg" style={{ fontFamily: 'Lora, serif' }}>
                                  {count}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 mb-8 text-sm" style={{ fontFamily: 'Lora, serif' }}>
              <span className="text-slate-600">Availability:</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: 'rgba(217, 119, 6, 0.3)' }}></div>
                <span className="text-slate-600">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: 'rgba(217, 119, 6, 0.65)' }}></div>
                <span className="text-slate-600">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: 'rgba(217, 119, 6, 1)' }}></div>
                <span className="text-slate-600">High</span>
              </div>
            </div>

            {Object.keys(summary).length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Detailed Time Breakdown
                </h3>
                
                {Object.entries(summary)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([slotKey, data]) => {
                    const [week, day] = slotKey.split('-');
                    return (
                      <div key={slotKey} className="mb-6 p-6 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Lora, serif' }}>
                            {week} {day}
                          </h4>
                          <span className="px-4 py-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full text-sm font-medium" style={{ fontFamily: 'Lora, serif' }}>
                            {data.count} {data.count === 1 ? 'person' : 'people'}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {Object.entries(data.times)
                            .sort(([, a], [, b]) => b.length - a.length)
                            .map(([time, names]) => (
                              <div key={time} className="flex items-center gap-4">
                                <div className="w-24 text-sm font-medium text-slate-700" style={{ fontFamily: 'Lora, serif' }}>
                                  {time}
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                  <div className="flex-1 bg-white rounded-lg px-3 py-2 text-sm text-slate-600" style={{ fontFamily: 'Lora, serif' }}>
                                    {names.join(', ')}
                                  </div>
                                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium" style={{ fontFamily: 'Lora, serif' }}>
                                    {names.length}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {participants.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-lg text-slate-500" style={{ fontFamily: 'Lora, serif' }}>
                  No responses yet. Share the invite link to get started!
                </p>
              </div>
            )}
          </div>

          {participants.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-10">
              <h2 className="text-2xl font-bold mb-6 text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                Participants
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.map((participant, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                    <div className="font-semibold text-slate-800" style={{ fontFamily: 'Lora, serif' }}>
                      {participant.name}
                    </div>
                    <div className="text-sm text-slate-600" style={{ fontFamily: 'Lora, serif' }}>
                      {participant.email}
                    </div>
                    <div className="text-xs text-slate-500 mt-2" style={{ fontFamily: 'Lora, serif' }}>
                      {Object.keys(participant.availability).length} slot{Object.keys(participant.availability).length !== 1 ? 's' : ''} available
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:wght@400;500;600&display=swap');
        `}</style>
      </div>
    );
  }

  return null;
};

export default RecurringMeetingScheduler;