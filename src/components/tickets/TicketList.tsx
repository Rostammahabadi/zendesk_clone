import { useState, useRef, useEffect } from "react";
import { NewTicketModal } from "./NewTicketModal";
import { useNavigate, useParams } from "react-router-dom";
import { useTickets } from "../../hooks/queries/useTickets";
import { ChevronDown, ChevronUp, ArrowUpDown, Search } from "lucide-react";

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc' | null;
}

interface FilterConfig {
  [key: string]: {
    isOpen: boolean;
    values: string[];
  };
}

export function TicketList() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: '', direction: null });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [activeHeader, setActiveHeader] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClosedTickets, setShowClosedTickets] = useState(false);
  const navigate = useNavigate();
  const { role } = useParams();
  const { data: tickets = [], isLoading } = useTickets();
  const [localSortedTickets, setLocalSortedTickets] = useState<typeof tickets>([]);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/${role}/dashboard/tickets/${ticketId}`);
  };

  const handleHeaderClick = (field: string) => {
    setActiveHeader(activeHeader === field ? null : field);
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
    setActiveHeader(null);
    
    // Force re-sort of tickets
    const newSortedTickets = [...(tickets || [])].sort((a, b) => {
      if (field === 'created_at') {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      const aValue = String(a[field as keyof typeof a] || '');
      const bValue = String(b[field as keyof typeof b] || '');
      
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setLocalSortedTickets(newSortedTickets);
  };

  const handleFilter = (field: string, value: string) => {
    setFilterConfig(prev => ({
      ...prev,
      [field]: {
        isOpen: true,
        values: prev[field]?.values.includes(value)
          ? prev[field].values.filter(v => v !== value)
          : [...(prev[field]?.values || []), value]
      }
    }));
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return Math.floor(seconds) + 's ago';
  };

  const sortedAndFilteredTickets = (localSortedTickets.length > 0 ? localSortedTickets : tickets)
    .filter(ticket => {
      // First apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          ticket.subject?.toLowerCase().includes(searchLower) ||
          ticket.id?.toLowerCase().includes(searchLower) ||
          ticket.created_by?.full_name?.toLowerCase().includes(searchLower) ||
          ticket.status?.toLowerCase().includes(searchLower) ||
          ticket.priority?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Then apply column filters
      return Object.entries(filterConfig).every(([field, config]) => {
        if (!config.isOpen || config.values.length === 0) return true;
        
        if (field === 'created_by') {
          const customerName = ticket.created_by?.full_name || 'Unknown';
          return config.values.includes(customerName);
        }

        if (field === 'created_at') {
          const ticketDate = new Date(ticket.created_at).toISOString().split('T')[0];
          return config.values.some(dateStr => dateStr === ticketDate);
        }
        
        const value = ticket[field as keyof typeof ticket];
        return config.values.includes(String(value));
      });
    })
    .sort((a, b) => {
      if (!sortConfig.field || !sortConfig.direction) return 0;

      // Special handling for created_at field
      if (sortConfig.field === 'created_at') {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      const aValue = a[sortConfig.field as keyof typeof a] ?? '';
      const bValue = b[sortConfig.field as keyof typeof b] ?? '';
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  // Separate tickets into active and closed
  const activeTickets = sortedAndFilteredTickets.filter(
    ticket => ticket.status !== 'closed'
  ).sort((a, b) => {
    // Sort by priority first (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    // Normalize priorities to lowercase for comparison
    const aPriority = a.priority.toLowerCase();
    const bPriority = b.priority.toLowerCase();
    const priorityDiff = (priorityOrder[aPriority as keyof typeof priorityOrder] || 0) - 
                        (priorityOrder[bPriority as keyof typeof priorityOrder] || 0);
    
    if (priorityDiff !== 0) return priorityDiff;

    // If same priority, sort by created date (newest first)
    const aDate = new Date(a.created_at).getTime();
    const bDate = new Date(b.created_at).getTime();
    return bDate - aDate;  // Newest first
  });

  const closedTickets = sortedAndFilteredTickets.filter(
    ticket => ticket.status === 'closed'
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const HeaderCell = ({ field, label }: { field: string; label: string }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isFilterable = ['created_by', 'status', 'priority', 'created_at'].includes(field);
    const uniqueValues = isFilterable ? Array.from(new Set(tickets.map(ticket => {
      if (field === 'created_by') {
        return ticket.created_by?.full_name || 'Unknown';
      }
      if (field === 'created_at') {
        return ticket.created_at;
      }
      return String(ticket[field as keyof typeof ticket]);
    }))).sort((a, b) => {
      if (field === 'created_at') {
        return new Date(b).getTime() - new Date(a).getTime();
      }
      return a.localeCompare(b);
    }) : [];

    const isActive = activeHeader === field;
    const currentSort = sortConfig.field === field ? sortConfig.direction : null;
    const currentFilters = filterConfig[field]?.values || [];

    // Group dates by day
    const groupDatesByDay = (dates: string[]) => {
      const groups: { [key: string]: string } = {};
      dates.forEach(date => {
        const dateObj = new Date(date);
        const dayKey = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        // Store just the date part (YYYY-MM-DD) as the value
        const dateValue = dateObj.toISOString().split('T')[0];
        groups[dayKey] = dateValue;
      });
      
      // Sort the days in reverse chronological order
      return Object.fromEntries(
        Object.entries(groups)
          .sort(([, a], [, b]) => new Date(b).getTime() - new Date(a).getTime())
      );
    };

    // Format the display value for the filter options
    const getDisplayValue = (value: string) => {
      if (field === 'created_at') {
        return new Date(value).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
      return value;
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setActiveHeader(null);
        }
      };

      if (isActive) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isActive]);

    const dateGroups = field === 'created_at' ? groupDatesByDay(uniqueValues as string[]) : null;

    // Update the filter handler for dates
    const handleDateFilter = (dateStr: string) => {
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      setFilterConfig(prev => ({
        ...prev,
        [field]: {
          isOpen: true,
          values: prev[field]?.values.includes(dateStr)
            ? prev[field].values.filter(v => v !== dateStr)
            : [...(prev[field]?.values || []), dateStr]
        }
      }));
    };

    return (
      <th className="px-6 py-3 text-left">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleHeaderClick(field);
            }}
            className="group inline-flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
          >
            {label}
            <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100" />
          </button>
          
          {isActive && (
            <div className="fixed z-50 mt-2 w-72 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5" 
                 style={{ 
                   right: field === 'created_at' ? '1rem' : 'auto',
                   maxHeight: 'calc(100vh - 200px)',
                   overflowY: 'auto',
                   top: 'auto'
                 }}>
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase sticky top-0 bg-white dark:bg-gray-800 z-10">
                  Sort
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSort(field, 'asc');
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    currentSort === 'asc' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50' : 'text-gray-700 dark:text-gray-200'
                  } hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <ChevronUp className="mr-2 h-4 w-4" />
                  {field === 'created_at' ? 'Oldest First' : 'Ascending'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSort(field, 'desc');
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    currentSort === 'desc' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50' : 'text-gray-700 dark:text-gray-200'
                  } hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {field === 'created_at' ? 'Newest First' : 'Descending'}
                </button>
                
                {isFilterable && uniqueValues.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase sticky top-[41px] bg-white dark:bg-gray-800 z-10">
                      Filter by Date
                    </div>
                    <div className="overflow-hidden">
                      {field === 'created_at' && dateGroups ? (
                        Object.entries(dateGroups).map(([displayDate, dateValue]) => (
                          <button
                            key={dateValue}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDateFilter(dateValue);
                            }}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              currentFilters.includes(dateValue) ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50' : 'text-gray-700 dark:text-gray-200'
                            } hover:bg-gray-100 dark:hover:bg-gray-700`}
                          >
                            <input
                              type="checkbox"
                              checked={currentFilters.includes(dateValue)}
                              onChange={() => {}}
                              className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600"
                            />
                            {displayDate}
                          </button>
                        ))
                      ) : (
                        uniqueValues.map((value) => (
                          <button
                            key={value}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFilter(field, value);
                            }}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              currentFilters.includes(value) ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50' : 'text-gray-700 dark:text-gray-200'
                            } hover:bg-gray-100 dark:hover:bg-gray-700`}
                          >
                            <input
                              type="checkbox"
                              checked={currentFilters.includes(value)}
                              onChange={() => {}}
                              className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600"
                            />
                            {getDisplayValue(value)}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-none p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All tickets</h2>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex-1 min-h-0 p-4 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow w-full mx-4">
              <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Tickets Section */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Tickets ({activeTickets.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <HeaderCell field="id" label="ID" />
                      <HeaderCell field="subject" label="Subject" />
                      <HeaderCell field="created_by" label="Customer" />
                      <HeaderCell field="status" label="Status" />
                      <HeaderCell field="priority" label="Priority" />
                      <HeaderCell field="created_at" label="Created" />
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {activeTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => handleTicketClick(ticket.id)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          #{ticket.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {ticket.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {ticket.created_by?.full_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${ticket.status === 'open' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : 
                              ticket.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' : 
                              'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100'}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${ticket.priority.toLowerCase() === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' : 
                              ticket.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' : 
                              'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'}`}>
                            {ticket.priority.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {getTimeAgo(ticket.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Closed Tickets Section */}
            {closedTickets.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                <button
                  onClick={() => setShowClosedTickets(!showClosedTickets)}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  <span>Closed Tickets ({closedTickets.length})</span>
                  {showClosedTickets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showClosedTickets && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <HeaderCell field="id" label="ID" />
                          <HeaderCell field="subject" label="Subject" />
                          <HeaderCell field="created_by" label="Customer" />
                          <HeaderCell field="status" label="Status" />
                          <HeaderCell field="priority" label="Priority" />
                          <HeaderCell field="created_at" label="Created" />
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {closedTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            onClick={() => handleTicketClick(ticket.id)}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              #{ticket.id.slice(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {ticket.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {ticket.created_by?.full_name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                                {ticket.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${ticket.priority.toLowerCase() === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' : 
                                  ticket.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' : 
                                  'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'}`}>
                                {ticket.priority.toLowerCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {getTimeAgo(ticket.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {isNewTicketModalOpen && (
        <NewTicketModal isOpen={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} />
      )}
    </div>
  );
}
