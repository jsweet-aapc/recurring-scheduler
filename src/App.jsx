import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Mail, Users, Link as LinkIcon, Check, X, Globe, ChevronRight } from 'lucide-react';

const RecurringMeetingScheduler = () => {
  const [view, setView] = useState('home'); // home, meeting
  const [meetingId, setMeetingId] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  
  // Participant form state
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedTimes, setSelectedTimes] = useState({});
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [existingParticipantIndex, setExistingParticipantIndex] = useState(null);
  
  // Setup form state
  const [meetingTitle, setMeetingTitle] = useState('');
  
  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [isTimeDragging, setIsTimeDragging] = useState(false);
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
        const meetingDataStr = localStorage.getItem(`meeting:${meetingId}`);
        if (meetingDataStr) {
          setMeetingData(JSON.parse(meetingDataStr));
        }
        
        const participantsDataStr = localStorage.getItem(`participants:${meetingId}`);
        if (participantsDataStr) {
          setParticipants(JSON.parse(participantsDataStr));
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
      createdAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(`meeting:${newMeetingId}`, JSON.stringify(meeting));
      localStorage.setItem(`participants:${newMeetingId}`, JSON.stringify([]));
      
      setMeetingId(newMeetingId);
      setMeetingData(meeting);
    } catch (error) {
      alert('Failed to create meeting. Please try again.');
    }
  };

  // Join existing meeting
  const handleJoinMeeting = (id) => {
    setMeetingId(id);
    setView('meeting');
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
    if (!participantName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (Object.keys(selectedSlots).length === 0) {
      alert('Please select at least one day/week combination');
      return;
    }

    const participant = {
      name: participantName,
      email: participantEmail.trim() || 'Not provided',
      availability: selectedTimes,
      timezone: timezone,
      submittedAt: new Date().toISOString()
    };

    try {
      let currentParticipants = [...participants];
      
      // If email provided, check for existing participant
      if (participantEmail.trim()) {
        const existingIndex = currentParticipants.findIndex(p => p.email === participantEmail);
        if (existingIndex !== -1) {
          currentParticipants[existingIndex] = participant;
        } else {
          currentParticipants.push(participant);
        }
      } else {
        // No email, always add as new
        currentParticipants.push(participant);
      }
      
      localStorage.setItem(`participants:${meetingId}`, JSON.stringify(currentParticipants));
      setParticipants(currentParticipants);
      
      alert('Availability saved! You can update it anytime by using the same email.');
    } catch (error) {
      alert('Failed to submit availability. Please try again.');
    }
  };
  
  // Load existing participant data
  const loadExistingAvailability = () => {
    if (!participantEmail.trim()) return;
    
    const existingIndex = participants.findIndex(p => p.email === participantEmail);
    if (existingIndex !== -1) {
      const existing = participants[existingIndex];
      setParticipantName(existing.name);
      setTimezone(existing.timezone || timezone);
      setExistingParticipantIndex(existingIndex);
      
      // Rebuild selectedSlots and selectedTimes from availability
      const newSelectedSlots = {};
      const newSelectedTimes = existing.availability || {};
      
      Object.keys(newSelectedTimes).forEach(slotKey => {
        newSelectedSlots[slotKey] = true;
      });
      
      setSelectedSlots(newSelectedSlots);
      setSelectedTimes(newSelectedTimes);
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
    setShowLinkCopied(true);
    setTimeout(() => setShowLinkCopied(false), 2000);
  };
  
  const goToMeeting = () => {
    window.location.href = `${window.location.origin}${window.location.pathname}?meeting=${meetingId}`;
  };

  // Parse URL for meeting ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('meeting');
    if (id) {
      setMeetingId(id);
      setView('meeting');
    }
  }, []);

  // Home View
  if (view === 'home') {
    const shareLink = meetingId ? `${window.location.origin}${window.location.pathname}?meeting=${meetingId}` : '';
    
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-3 text-white">
              Recurring Meeting Planner
            </h1>
            <p className="text-lg text-gray-400">
              Find the perfect time for your monthly meetings
            </p>
          </div>

          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-8 shadow-xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g., Monthly Team Sync"
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-500"
                />
              </div>

              <button
                onClick={handleCreateMeeting}
                disabled={!meetingTitle.trim() || meetingId}
                className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all"
              >
                Create Meeting
              </button>
            </div>
            
            {meetingId && meetingData && (
              <div className="mt-8 pt-8 border-t-2 border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-bold text-white">Meeting Created!</h2>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Shareable Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-4 py-3 border-2 border-gray-600 rounded-lg bg-gray-800 text-gray-300 font-mono text-sm"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      onClick={copyLink}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all whitespace-nowrap"
                    >
                      {showLinkCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-200">
                    Share this link with participants to collect their recurring monthly availability.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={goToMeeting}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >
                    Go to Meeting
                  </button>
                  <button
                    onClick={() => setView('meeting')}
                    className="bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all border border-gray-600"
                  >
                    View Results
                  </button>
                  <button
                    onClick={() => {
                      setMeetingId(null);
                      setMeetingData(null);
                      setMeetingTitle('');
                      setParticipants([]);
                    }}
                    className="border-2 border-gray-600 text-gray-300 px-4 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { font-family: 'Inter', sans-serif; }
        `}</style>
      </div>
    );
  }

  // Meeting View - Split screen with input on left, results on right
  if (view === 'meeting') {
    if (!meetingData) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-gray-400">Loading meeting...</div>
          </div>
        </div>
      );
    }

    const summary = getAvailabilitySummary();
    const maxCount = Math.max(...Object.values(summary).map(s => s.count), 1);

    return (
      <div className="min-h-screen bg-black text-white">
        <div className="border-b-2 border-gray-800 bg-black sticky top-0 z-10">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <h1 className="text-3xl font-bold mb-1 text-white">
              {meetingData.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{participants.length} {participants.length === 1 ? 'response' : 'responses'}</span>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                <LinkIcon className="w-4 h-4" />
                {showLinkCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-[1800px] mx-auto px-6 py-8">
          {/* LEFT SIDE - Input Form */}
          <div className="space-y-6">
            <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Your Availability</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Your Email (optional)
                  </label>
                  <input
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    onBlur={loadExistingAvailability}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Your Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-800 text-white"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6 text-sm text-blue-200">
                <strong>Instructions:</strong> Click the boxes below to select the day-week combinations when you're available (e.g., "1st Monday"). Then select your available times for each selection. You can update your availability anytime.
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-white">Step 1: Select Day & Week</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-2 border-gray-700 p-2 bg-gray-800 text-xs font-semibold text-gray-400">Week of Month</th>
                        {daysOfWeek.map(day => (
                          <th key={day} className="border-2 border-gray-700 p-2 bg-gray-800 text-xs font-semibold text-gray-300">
                            {day.substring(0, 3)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weeksOfMonth.map(week => (
                        <tr key={week}>
                          <td className="border-2 border-gray-700 p-2 bg-gray-800 text-xs font-semibold text-gray-300">
                            {week}
                          </td>
                          {daysOfWeek.map(day => {
                            const key = `${week}-${day}`;
                            const isSelected = selectedSlots[key];
                            return (
                              <td key={key} className="border-2 border-gray-700 p-0">
                                <button
                                  onClick={() => toggleSlot(day, week)}
                                  className={`w-full h-12 transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'bg-green-600 hover:bg-green-500' 
                                      : 'bg-gray-800 hover:bg-gray-700'
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
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 text-white">Step 2: Select Times</h3>
                  <p className="text-sm text-gray-400 mb-4">Click and drag to select multiple times. Times shown in {timezone}</p>

                  {Object.keys(selectedSlots).map(slotKey => {
                    const [week, day] = slotKey.split('-');
                    return (
                      <div key={slotKey} className="mb-4 p-4 bg-gray-800 rounded-lg border-2 border-gray-700">
                        <h4 className="text-base font-semibold mb-3 text-gray-200">
                          {week} {day}
                        </h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {timeSlots.map(time => {
                            const isSelected = selectedTimes[slotKey]?.includes(time);
                            return (
                              <button
                                key={time}
                                onMouseDown={() => handleTimeMouseDown(slotKey, time)}
                                onMouseEnter={() => handleTimeMouseEnter(slotKey, time)}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all select-none ${
                                  isSelected
                                    ? 'bg-green-700 text-white hover:bg-green-600 border-2 border-green-500'
                                    : 'bg-gray-700 border-2 border-gray-600 text-gray-300 hover:border-green-600'
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

              <button
                onClick={handleSubmitAvailability}
                className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Submit Availability
              </button>
            </div>
          </div>

          {/* RIGHT SIDE - Results */}
          <div className="space-y-6">
            <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Group Availability</h2>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-700 p-2 bg-gray-800 text-xs font-semibold text-gray-400">Week</th>
                      {daysOfWeek.map(day => (
                        <th key={day} className="border-2 border-gray-700 p-2 bg-gray-800 text-xs font-semibold text-gray-300">
                          {day.substring(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeksOfMonth.map(week => (
                      <tr key={week}>
                        <td className="border-2 border-gray-700 p-2 bg-gray-800 text-xs font-semibold text-gray-300">
                          {week}
                        </td>
                        {daysOfWeek.map(day => {
                          const key = `${week}-${day}`;
                          const data = summary[key];
                          
                          return (
                            <td key={key} className="border-2 border-gray-700 p-2 bg-gray-800 text-xs align-top">
                              {data && data.count > 0 ? (
                                <div className="space-y-1">
                                  <div className="font-bold text-green-400 mb-1">{data.count} {data.count === 1 ? 'person' : 'people'}</div>
                                  {Object.entries(data.times)
                                    .sort(([, a], [, b]) => b.length - a.length)
                                    .slice(0, 3)
                                    .map(([time, names]) => (
                                      <div key={time} className="text-gray-400">
                                        <div className="font-semibold text-gray-300">{time}</div>
                                        <div className="text-xs">{names.join(', ')}</div>
                                      </div>
                                    ))}
                                  {Object.keys(data.times).length > 3 && (
                                    <div className="text-xs text-gray-500 italic">+{Object.keys(data.times).length - 3} more times</div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-600 text-center">—</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {participants.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-700 mb-4" />
                  <p className="text-gray-400">
                    No responses yet. Share the link to get started!
                  </p>
                </div>
              )}
            </div>

            {participants.length > 0 && (
              <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Participants ({participants.length})</h2>
                <div className="space-y-2">
                  {participants.map((participant, idx) => (
                    <div key={idx} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="font-semibold text-gray-200 text-sm">
                        {participant.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {participant.email !== 'Not provided' ? participant.email : 'No email'} • {Object.keys(participant.availability).length} slot{Object.keys(participant.availability).length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

  return null;
};

export default RecurringMeetingScheduler;