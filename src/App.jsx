import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Mail, Users, Link as LinkIcon, Check, X, Globe } from 'lucide-react';

const RecurringMeetingScheduler = () => {
  const [view, setView] = useState('home'); // home, share, participate, results
  const [meetingId, setMeetingId] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const [participants, setParticipants] = useState([]);
  
  // Participant form state
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedTimes, setSelectedTimes] = useState({});
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Setup form state
  const [meetingTitle, setMeetingTitle] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  
  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragMode, setDragMode] = useState(null); // 'select' or 'deselect'
  const [isTimeDragging, setIsTimeDragging] = useState(false);
  const [timeDragStart, setTimeDragStart] = useState(null);
  const [timeDragMode, setTimeDragMode] = useState(null);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weeksOfMonth = ['1st', '2nd', '3rd', '4th', '5th'];
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
  
  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  // Load meeting data and participants
  useEffect(() => {
    const loadData = () => {
      if (!meetingId) return;
      
      try {
        const meetingData = localStorage.getItem(`meeting:${meetingId}`);
        if (meetingData) {
          setMeetingData(JSON.parse(meetingData));
        }
        
        const participantsData = localStorage.getItem(`participants:${meetingId}`);
        if (participantsData) {
          setParticipants(JSON.parse(participantsData));
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
  const handleCreateMeeting = () => {
    if (!meetingTitle.trim()) return;
    
    const newMeetingId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const meeting = {
      id: newMeetingId,
      title: meetingTitle,
      organizerEmail,
      createdAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(`meeting:${newMeetingId}`, JSON.stringify(meeting));
      localStorage.setItem(`participants:${newMeetingId}`, JSON.stringify([]));
      
      setMeetingId(newMeetingId);
      setMeetingData(meeting);
      // Stay on home view - don't change view
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
  
  // Drag selection for grid
  const handleMouseDown = (day, week) => {
    const key = `${week}-${day}`;
    setIsDragging(true);
    setDragStart(key);
    setDragMode(selectedSlots[key] ? 'deselect' : 'select');
    toggleSlot(day, week);
  };
  
  const handleMouseEnter = (day, week) => {
    if (!isDragging) return;
    const key = `${week}-${day}`;
    
    if (dragMode === 'select' && !selectedSlots[key]) {
      toggleSlot(day, week);
    } else if (dragMode === 'deselect' && selectedSlots[key]) {
      toggleSlot(day, week);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setDragMode(null);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

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
  
  // Drag selection for times
  const handleTimeMouseDown = (slotKey, time) => {
    setIsTimeDragging(true);
    setTimeDragStart(`${slotKey}-${time}`);
    const isSelected = selectedTimes[slotKey]?.includes(time);
    setTimeDragMode(isSelected ? 'deselect' : 'select');
    toggleTime(slotKey, time);
  };
  
  const handleTimeMouseEnter = (slotKey, time) => {
    if (!isTimeDragging) return;
    
    const isSelected = selectedTimes[slotKey]?.includes(time);
    
    if (timeDragMode === 'select' && !isSelected) {
      toggleTime(slotKey, time);
    } else if (timeDragMode === 'deselect' && isSelected) {
      toggleTime(slotKey, time);
    }
  };
  
  const handleTimeMouseUp = () => {
    setIsTimeDragging(false);
    setTimeDragStart(null);
    setTimeDragMode(null);
  };
  
  useEffect(() => {
    if (isTimeDragging) {
      document.addEventListener('mouseup', handleTimeMouseUp);
      return () => document.removeEventListener('mouseup', handleTimeMouseUp);
    }
  }, [isTimeDragging]);

  // Submit participant availability
  const handleSubmitAvailability = () => {
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
      localStorage.setItem(`participants:${meetingId}`, JSON.stringify(currentParticipants));
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

  // Home View - Combined with meeting creation success
  if (view === 'home') {
    const shareLink = meetingId ? `${window.location.origin}${window.location.pathname}?meeting=${meetingId}` : '';
    
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-3 text-gray-900">
              Recurring
            </h1>
            <p className="text-lg text-gray-600">
              Find the perfect time for your monthly meetings
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g., Monthly Team Sync"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email (optional)
                </label>
                <input
                  type="email"
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  placeholder="organizer@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                />
              </div>

              <button
                onClick={handleCreateMeeting}
                disabled={!meetingTitle.trim() || meetingId}
                className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Create Meeting
              </button>
            </div>
            
            {/* Show Meeting Created section after creation */}
            {meetingId && meetingData && (
              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Meeting Created!</h2>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Shareable Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        alert('Link copied to clipboard!');
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all whitespace-nowrap"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>Next steps:</strong> Share this link via email, Slack, or any messaging platform. 
                    Each participant will use it to submit their recurring monthly availability.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setView('participate')}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >
                    Add Availability
                  </button>
                  <button
                    onClick={() => setView('results')}
                    className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                  >
                    View Results
                  </button>
                  <button
                    onClick={() => {
                      setMeetingId(null);
                      setMeetingData(null);
                      setMeetingTitle('');
                      setOrganizerEmail('');
                      setView('home');
                    }}
                    className="border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Create Another Meeting
                  </button>
                </div>
              </div>
            )}
          </div>

          {!meetingId && (
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Share a link with participants to collect their recurring availability</p>
            </div>
          )}
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { font-family: 'Inter', sans-serif; }
        `}</style>
      </div>
    );
  }

  // Share View - Remove this, now combined with home
  if (view === 'share') {
    // Redirect to home if someone lands here
    setView('home');
    return null;
  }

  // Participate View
  if (view === 'participate') {
    if (!meetingData) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading meeting...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">
              {meetingData.title}
            </h1>
            <p className="text-gray-600">
              Select your recurring monthly availability
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm mb-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Your Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">
                Step 1: Select Day & Week Combinations
              </h2>
              <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                💡 Click and drag to select multiple slots at once
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-300 p-2 bg-gray-100 text-xs font-semibold"></th>
                      {daysOfWeek.map(day => (
                        <th key={day} className="border-2 border-gray-300 p-2 bg-gray-100 text-xs font-semibold text-gray-700">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeksOfMonth.map(week => (
                      <tr key={week}>
                        <td className="border-2 border-gray-300 p-2 bg-gray-100 text-xs font-semibold text-gray-700">
                          {week}
                        </td>
                        {daysOfWeek.map(day => {
                          const key = `${week}-${day}`;
                          const isSelected = selectedSlots[key];
                          return (
                            <td key={key} className="border-2 border-gray-300 p-0">
                              <button
                                onMouseDown={() => handleMouseDown(day, week)}
                                onMouseEnter={() => handleMouseEnter(day, week)}
                                className={`w-full h-12 transition-all cursor-pointer select-none ${
                                  isSelected 
                                    ? 'bg-green-500 hover:bg-green-600' 
                                    : 'bg-white hover:bg-gray-100'
                                }`}
                              >
                                {isSelected && <Check className="w-5 h-5 mx-auto text-white" />}
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
                <h2 className="text-2xl font-bold mb-3 text-gray-900">
                  Step 2: Select Available Times
                </h2>
                <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  💡 Click and drag to select multiple times at once • Times shown in {timezone}
                </p>

                {Object.keys(selectedSlots).map(slotKey => {
                  const [week, day] = slotKey.split('-');
                  return (
                    <div key={slotKey} className="mb-6 p-5 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">
                        {week} {day} of each month
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots.map(time => {
                          const isSelected = selectedTimes[slotKey]?.includes(time);
                          return (
                            <button
                              key={time}
                              onMouseDown={() => handleTimeMouseDown(slotKey, time)}
                              onMouseEnter={() => handleTimeMouseEnter(slotKey, time)}
                              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all select-none ${
                                isSelected
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-500'
                              }`}
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
                className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Results
              </button>
              <button
                onClick={handleSubmitAvailability}
                className="flex-1 bg-blue-600 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Submit Availability
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { font-family: 'Inter', sans-serif; }
          button { user-select: none; -webkit-user-select: none; }
        `}</style>
      </div>
    );
  }

  // Results View
  if (view === 'results') {
    if (!meetingData) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading meeting...</div>
          </div>
        </div>
      );
    }

    const summary = getAvailabilitySummary();
    const maxCount = Math.max(...Object.values(summary).map(s => s.count), 1);

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">
              {meetingData.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {participants.length} {participants.length === 1 ? 'person has' : 'people have'} responded
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                <LinkIcon className="w-4 h-4" />
                Copy Invite Link
              </button>
              <button
                onClick={() => setView('participate')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                <Users className="w-4 h-4" />
                Add Your Availability
              </button>
              <button
                onClick={() => {
                  setMeetingId(null);
                  setMeetingData(null);
                  setParticipants([]);
                  setView('home');
                }}
                className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                <Calendar className="w-4 h-4" />
                Create New Meeting
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm mb-6">
            <h2 className="text-2xl font-bold mb-5 text-gray-900">
              Availability Overview
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-2 border-gray-300 p-2 bg-gray-100 text-xs font-semibold"></th>
                    {daysOfWeek.map(day => (
                      <th key={day} className="border-2 border-gray-300 p-2 bg-gray-100 text-xs font-semibold text-gray-700">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeksOfMonth.map(week => (
                    <tr key={week}>
                      <td className="border-2 border-gray-300 p-2 bg-gray-100 text-xs font-semibold text-gray-700">
                        {week}
                      </td>
                      {daysOfWeek.map(day => {
                        const key = `${week}-${day}`;
                        const count = summary[key]?.count || 0;
                        const opacity = count / maxCount;
                        
                        return (
                          <td key={key} className="border-2 border-gray-300 p-0">
                            <div
                              className="h-12 flex items-center justify-center transition-all cursor-pointer"
                              style={{
                                backgroundColor: count > 0 
                                  ? `rgba(34, 197, 94, ${0.2 + opacity * 0.8})` 
                                  : 'white'
                              }}
                              title={count > 0 ? `${count} available` : 'No availability'}
                            >
                              {count > 0 && (
                                <div className="text-white font-bold text-base">
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

            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-600 font-semibold">Availability:</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }}></div>
                <span className="text-gray-600">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ backgroundColor: 'rgba(34, 197, 94, 0.65)' }}></div>
                <span className="text-gray-600">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-gray-300" style={{ backgroundColor: 'rgba(34, 197, 94, 1)' }}></div>
                <span className="text-gray-600">High</span>
              </div>
            </div>

            {Object.keys(summary).length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Detailed Time Breakdown
                </h3>
                
                {Object.entries(summary)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([slotKey, data]) => {
                    const [week, day] = slotKey.split('-');
                    return (
                      <div key={slotKey} className="mb-5 p-5 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {week} {day}
                          </h4>
                          <span className="px-4 py-1.5 bg-green-500 text-white rounded-full text-sm font-semibold">
                            {data.count} {data.count === 1 ? 'person' : 'people'}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {Object.entries(data.times)
                            .sort(([, a], [, b]) => b.length - a.length)
                            .map(([time, names]) => (
                              <div key={time} className="flex items-center gap-4">
                                <div className="w-20 text-sm font-semibold text-gray-700">
                                  {time}
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                  <div className="flex-1 bg-white rounded-lg px-3 py-2 text-sm text-gray-600 border border-gray-200">
                                    {names.join(', ')}
                                  </div>
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
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
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg text-gray-500">
                  No responses yet. Share the invite link to get started!
                </p>
              </div>
            )}
          </div>

          {participants.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-5 text-gray-900">
                Participants ({participants.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.map((participant, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-800">
                      {participant.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {participant.email}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {Object.keys(participant.availability).length} slot{Object.keys(participant.availability).length !== 1 ? 's' : ''} available
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { font-family: 'Inter', sans-serif; }
        `}</style>
      </div>
    );
  }

  return null;
};

export default RecurringMeetingScheduler;