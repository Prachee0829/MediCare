import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Dr. Sarah Johnson - General Checkup',
      date: new Date(2023, 5, 15, 9, 0),
      endDate: new Date(2023, 5, 15, 9, 30),
      type: 'appointment',
      status: 'confirmed',
      with: 'John Doe'
    },
    {
      id: 2,
      title: 'Dr. Michael Chen - Cardiology Consultation',
      date: new Date(2023, 5, 15, 10, 30),
      endDate: new Date(2023, 5, 15, 11, 15),
      type: 'appointment',
      status: 'confirmed',
      with: 'Jane Smith'
    },
    {
      id: 3,
      title: 'Dr. Emily Rodriguez - Dermatology',
      date: new Date(2023, 5, 15, 13, 15),
      endDate: new Date(2023, 5, 15, 13, 45),
      type: 'appointment',
      status: 'cancelled',
      with: 'Robert Johnson'
    },
    {
      id: 4,
      title: 'Dr. Sarah Johnson - Pediatric Checkup',
      date: new Date(2023, 5, 16, 11, 0),
      endDate: new Date(2023, 5, 16, 11, 30),
      type: 'appointment',
      status: 'confirmed',
      with: 'Maria Garcia'
    },
    {
      id: 5,
      title: 'Dr. James Taylor - Orthopedic Consultation',
      date: new Date(2023, 5, 16, 14, 45),
      endDate: new Date(2023, 5, 16, 15, 30),
      type: 'appointment',
      status: 'pending',
      with: 'David Wilson'
    },
    {
      id: 6,
      title: 'Staff Meeting',
      date: new Date(2023, 5, 17, 9, 0),
      endDate: new Date(2023, 5, 17, 10, 0),
      type: 'meeting',
      status: 'confirmed',
      with: 'All Staff'
    },
    {
      id: 7,
      title: 'Inventory Check',
      date: new Date(2023, 5, 18, 14, 0),
      endDate: new Date(2023, 5, 18, 16, 0),
      type: 'task',
      status: 'confirmed',
      with: 'Pharmacy Staff'
    }
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState('month'); // 'month', 'week', 'day'

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week the month starts on (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add previous month's days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      const day = daysInPrevMonth - firstDayOfMonth + i + 1;
      days.push({
        day,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }
    
    // Add next month's days to fill the calendar (6 rows of 7 days = 42 cells)
    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Get events for a specific day
  const getEventsForDay = (day, month, year) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Handle day click
  const handleDayClick = (day) => {
    setSelectedDate(new Date(day.year, day.month, day.day));
    if (view === 'month') {
      setView('day');
    }
  };

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Get type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case 'appointment':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Appointment</span>;
      case 'meeting':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Meeting</span>;
      case 'task':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Task</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{type}</span>;
    }
  };

  // Render month view
  const renderMonthView = () => {
    const days = generateCalendarDays();
    const today = new Date();
    
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{formatDate(currentDate)}</h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 text-center py-2 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="text-sm font-medium text-gray-500">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, index) => {
            const isToday = 
              day.day === today.getDate() && 
              day.month === today.getMonth() && 
              day.year === today.getFullYear();
            
            const isSelected = 
              day.day === selectedDate.getDate() && 
              day.month === selectedDate.getMonth() && 
              day.year === selectedDate.getFullYear();
            
            const dayEvents = getEventsForDay(day.day, day.month, day.year);
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                className={`min-h-[100px] p-1 border-b border-r border-gray-200 ${!day.isCurrentMonth ? 'bg-gray-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start">
                  <div 
                    className={`flex items-center justify-center h-6 w-6 rounded-full text-sm ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                  >
                    {day.day}
                  </div>
                  {dayEvents.length > 0 && (
                    <span className="text-xs font-medium text-blue-600">{dayEvents.length} events</span>
                  )}
                </div>
                
                <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                  {dayEvents.slice(0, 3).map(event => (
                    <div 
                      key={event.id}
                      className={`px-2 py-1 text-xs rounded truncate ${event.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      {formatTime(event.date)} {event.title.split(' - ')[0]}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-center text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDay(
      selectedDate.getDate(),
      selectedDate.getMonth(),
      selectedDate.getFullYear()
    ).sort((a, b) => a.date - b.date);
    
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <button 
            className="flex items-center text-blue-600 hover:text-blue-800"
            onClick={() => setView('month')}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Month
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <button 
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              // Add new event functionality
            }}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="divide-y divide-gray-200">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = event.date.getHours();
              return eventHour === hour || (eventHour < hour && event.endDate.getHours() > hour);
            });
            
            return (
              <div key={hour} className="flex">
                <div className="w-20 py-4 px-4 text-right text-sm text-gray-500 border-r border-gray-200">
                  {hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                </div>
                <div className="flex-1 min-h-[60px] py-2 px-4 relative">
                  {hourEvents.map(event => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-2 mb-2 rounded-lg ${event.status === 'cancelled' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-blue-50 border-l-4 border-blue-500'}`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-gray-600">
                            {formatTime(event.date)} - {formatTime(event.endDate)}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          {getTypeBadge(event.type)}
                          {getStatusBadge(event.status)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            onClick={() => setView('day')}
          >
            Day
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            + New Event
          </button>
        </div>
      </div>

      {view === 'month' ? renderMonthView() : renderDayView()}

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsModalOpen(false)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedEvent.title}</h3>
                    <div className="flex space-x-2 mt-2">
                      {getTypeBadge(selectedEvent.type)}
                      {getStatusBadge(selectedEvent.status)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Time & Date</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Date</p>
                          <p className="text-sm text-gray-600">
                            {selectedEvent.date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Time</p>
                          <p className="text-sm text-gray-600">
                            {formatTime(selectedEvent.date)} - {formatTime(selectedEvent.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">With</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedEvent.with}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      // Edit functionality
                    }}
                  >
                    Edit
                  </button>
                  {selectedEvent.status !== 'cancelled' && (
                    <button 
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => {
                        // Cancel functionality
                      }}
                    >
                      Cancel Event
                    </button>
                  )}
                  <button 
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-auto"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;