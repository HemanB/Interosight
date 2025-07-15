import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Placeholder tags
const ALL_TAGS: string[] = [
  'Breakfast', 'Lunch', 'Dinner', 'Snack',
  'Trigger', 'Binge', 'Purge', 'Body Checking', 'Exercise', 'Other'
];

type LogEntry = {
  id: string;
  text: string;
  tags: string[];
  date: string;
  originalSection?: 'meal' | 'behavior';
};

type CalendarCell = {
  day: number;
  month: number;
  year: number;
  isCurrent: boolean;
};

// Stub LLM tagging function
function getSuggestedTags(input: string): string[] {
  // Simple keyword-based stub for now
  const lower = input.toLowerCase();
  const tags: string[] = [];
  if (lower.includes('breakfast')) tags.push('Breakfast');
  if (lower.includes('lunch')) tags.push('Lunch');
  if (lower.includes('dinner')) tags.push('Dinner');
  if (lower.includes('snack')) tags.push('Snack');
  if (lower.includes('binge')) tags.push('Binge');
  if (lower.includes('purge')) tags.push('Purge');
  if (lower.includes('body')) tags.push('Body Checking');
  if (lower.includes('exercise')) tags.push('Exercise');
  if (lower.includes('trigger')) tags.push('Trigger');
  if (tags.length === 0) tags.push('Other');
  return tags;
}

// Placeholder log data
const initialLogs: LogEntry[] = [
  { id: '1', text: 'Coffee and bagel', tags: ['Breakfast'], date: new Date().toDateString(), originalSection: 'meal' },
  { id: '2', text: 'Ran 5km', tags: ['Exercise'], date: new Date().toDateString(), originalSection: 'behavior' },
  { id: '3', text: 'Lunch: salad and chicken', tags: ['Lunch'], date: new Date().toDateString(), originalSection: 'meal' },
  { id: '4', text: 'Purged my lunch', tags: ['Purge'], date: new Date().toDateString(), originalSection: 'behavior' },
  { id: '5', text: 'Dinner: pasta', tags: ['Dinner'], date: new Date().toDateString(), originalSection: 'meal' },
  { id: '6', text: 'Body checking in mirror', tags: ['Body Checking'], date: new Date().toDateString(), originalSection: 'behavior' },
];

const analyticsCards = [
  { id: '1', title: 'Meal Patterns', icon: 'fast-food' },
  { id: '2', title: 'Behavior Trends', icon: 'pulse' },
  { id: '3', title: 'Streaks', icon: 'flame' },
  { id: '4', title: 'Mood Correlations', icon: 'happy' },
];

// Helper to generate calendar grid for any month (5x7, 5 weeks, 7 days per week)
function getCalendarGrid(month: number, year: number): CalendarCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon, 2=Tue, ...
  
  // For July 2025, we want July 1st to be Tuesday (day 2)
  // So we need to show 1 day from previous month (Monday)
  let prevMonthDays;
  if (month === 6 && year === 2025) {
    // July 2025: July 1st should be Tuesday
    prevMonthDays = 1; // Show 1 day from June (Monday)
  } else {
    // Normal calculation for other months
    prevMonthDays = (firstDay + 6) % 7;
  }
  
  const totalCells = 35; // Exactly 5 weeks * 7 days = 35 cells
  const grid: CalendarCell[] = [];
  let day = 1 - prevMonthDays;
  for (let i = 0; i < totalCells; i++, day++) {
    let cellDate: CalendarCell;
    if (day < 1) {
      // Previous month
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonthDaysCount = new Date(prevYear, prevMonth + 1, 0).getDate();
      cellDate = { day: prevMonthDaysCount + day, month: prevMonth, year: prevYear, isCurrent: false };
    } else if (day > daysInMonth) {
      // Next month
      cellDate = { day: day - daysInMonth, month: (month + 1) % 12, year: month === 11 ? year + 1 : year, isCurrent: false };
    } else {
      // Current month
      cellDate = { day, month, year, isCurrent: true };
    }
    grid.push(cellDate);
  }
  return grid;
}

// Helper to get month name
function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month];
}

const LoggingScreen: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString());
  const [selectedCalendarCell, setSelectedCalendarCell] = useState<CalendarCell | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<number>(6); // July (0-indexed)
  const [calendarYear, setCalendarYear] = useState<number>(2025);
  const [showTagPopup, setShowTagPopup] = useState<boolean>(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Tag definitions
  const mealTags = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const behaviorTags = ['Trigger', 'Binge', 'Purge', 'Body Checking', 'Exercise', 'Other'];

  // Handle input change and update suggested tags
  const handleInputChange = (text: string) => {
    setInput(text);
    const tags = getSuggestedTags(text);
    setSuggestedTags(tags);
    setSelectedTags(tags);
  };

  // Handle tag add/remove
  const toggleTag = (tag: string) => {
    setSelectedTags((prev: string[]) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle tag add/remove for existing logs
  const toggleLogTag = (logId: string, tag: string) => {
    setLogs(prevLogs => 
      prevLogs.map(log => 
        log.id === logId 
          ? {
              ...log,
              tags: log.tags.includes(tag) 
                ? log.tags.filter(t => t !== tag)
                : [...log.tags, tag]
            }
          : log
      )
    );
  };

  // Remove tag from log
  const removeLogTag = (logId: string, tag: string) => {
    setLogs(prevLogs => 
      prevLogs.map(log => 
        log.id === logId 
          ? {
              ...log,
              tags: log.tags.filter(t => t !== tag)
            }
          : log
      )
    );
  };

  // Add tag to log
  const addLogTag = (logId: string, tag: string) => {
    setLogs(prevLogs => 
      prevLogs.map(log => 
        log.id === logId 
          ? {
              ...log,
              tags: [...log.tags, tag]
            }
          : log
      )
    );
    setShowTagPopup(false);
    setEditingLogId(null);
  };

  // Open tag selection popup
  const openTagPopup = (logId: string) => {
    setEditingLogId(logId);
    setShowTagPopup(true);
  };

  // Handle log submit
  const handleSubmit = () => {
    if (!input.trim()) return;
    
    // Determine original section based on selected tags
    let originalSection: 'meal' | 'behavior' | undefined;
    if (selectedTags.length > 0) {
      const hasMealTag = selectedTags.some(tag => mealTags.includes(tag));
      const hasBehaviorTag = selectedTags.some(tag => behaviorTags.includes(tag));
      if (hasMealTag && !hasBehaviorTag) {
        originalSection = 'meal';
      } else if (hasBehaviorTag && !hasMealTag) {
        originalSection = 'behavior';
      } else if (hasMealTag && hasBehaviorTag) {
        // If mixed tags, default to meal
        originalSection = 'meal';
      }
    }
    
    setLogs([
      { id: Date.now().toString(), text: input, tags: selectedTags, date: selectedDate, originalSection },
      ...logs,
    ]);
    setInput('');
    setSuggestedTags([]);
    setSelectedTags([]);
  };

  // Split logs into meals and behaviors
  const todaysLogs = logs.filter((log) => log.date === new Date().toDateString());
  
  const mealLogs = todaysLogs.filter((log) => {
    if (log.tags.length === 0) {
      return log.originalSection === 'meal';
    }
    return log.tags.some((t) => mealTags.includes(t));
  });
  
  const behaviorLogs = todaysLogs.filter((log) => {
    if (log.tags.length === 0) {
      return log.originalSection === 'behavior';
    }
    return log.tags.some((t) => behaviorTags.includes(t));
  });

  // Logs for selected calendar day
  const selectedDayLogs = logs.filter((log) => {
    if (!selectedCalendarCell) return false;
    const d = new Date(selectedCalendarCell.year, selectedCalendarCell.month, selectedCalendarCell.day);
    return log.date === d.toDateString();
  });

  // Generate multiple months for vertical scrolling
  const monthsToShow = [
    { month: 5, year: 2025 }, // June 2025
    { month: 6, year: 2025 }, // July 2025
    { month: 7, year: 2025 }, // August 2025
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const screenWidth = Dimensions.get('window').width;

  // Component to render log tags with add/remove functionality
  const LogTags = ({ log }: { log: LogEntry }) => {
    const availableTags = ALL_TAGS.filter(tag => !log.tags.includes(tag));
    
    return (
      <View style={styles.tagsRow}>
        {log.tags.map((tag) => (
          <View key={tag} style={styles.logTag}>
            <Text style={styles.logTagText}>{tag}</Text>
            <TouchableOpacity 
              style={styles.tagRemoveButton}
              onPress={() => removeLogTag(log.id, tag)}
            >
              <Text style={styles.tagRemoveText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity 
          style={styles.addTagButton}
          onPress={() => openTagPopup(log.id)}
        >
          <Text style={styles.addTagText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top third: Logging input */}
      <View style={styles.inputBoxContainer}>
        <TextInput
          style={styles.inputBox}
          placeholder="What would you like to log today?"
          value={input}
          onChangeText={handleInputChange}
          multiline
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tag editor */}
      {suggestedTags.length > 0 && (
        <View style={styles.tagEditor}>
          <Text style={styles.tagEditorLabel}>Tags:</Text>
          <View style={styles.tagsRow}>
            {ALL_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={selectedTags.includes(tag) ? styles.tagTextSelected : styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Logs split side by side */}
      <View style={styles.logsSplitRow}>
        {/* Meal Logs */}
        <View style={styles.logCard}>
          <Text style={styles.logCardTitle}>Meal Logs</Text>
          {mealLogs.length === 0 ? (
            <Text style={styles.emptyText}>No meal logs for today.</Text>
          ) : (
            mealLogs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <Text style={styles.logText}>{log.text}</Text>
                <LogTags log={log} />
              </View>
            ))
          )}
        </View>
        {/* Behavior Logs */}
        <View style={styles.logCard}>
          <Text style={styles.logCardTitle}>Behavior Logs</Text>
          {behaviorLogs.length === 0 ? (
            <Text style={styles.emptyText}>No behavior logs for today.</Text>
          ) : (
            behaviorLogs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <Text style={styles.logText}>{log.text}</Text>
                <LogTags log={log} />
              </View>
            ))
          )}
        </View>
      </View>

      {/* Analytics 2x2 grid */}
      <View style={styles.analyticsGrid}>
        {analyticsCards.map((card, idx) => (
          <TouchableOpacity key={card.id} style={styles.analyticsCard}>
            <Ionicons name={card.icon as any} size={32} color="#4a90e2" />
            <Text style={styles.analyticsCardTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vertically scrollable multi-month calendar */}
      <View style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>Calendar</Text>
        <ScrollView style={styles.calendarScrollView} showsVerticalScrollIndicator={false}>
          {monthsToShow.map(({ month, year }) => {
            const monthGrid = getCalendarGrid(month, year);
            return (
              <View key={`${month}-${year}`} style={styles.monthCard}>
                <Text style={styles.monthTitle}>{getMonthName(month)} {year}</Text>
                <View style={styles.calendarWeekRow}>
                  {weekDays.map((wd) => (
                    <Text key={wd} style={styles.calendarWeekDay}>{wd}</Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {Array.from({ length: 5 }, (_, rowIndex) => (
                    <View key={rowIndex} style={styles.calendarRow}>
                      {monthGrid.slice(rowIndex * 7, (rowIndex + 1) * 7).map((cell, cellIndex) => {
                        const isSelected = selectedCalendarCell &&
                          cell.day === selectedCalendarCell.day &&
                          cell.month === selectedCalendarCell.month &&
                          cell.year === selectedCalendarCell.year;
                        return (
                          <TouchableOpacity
                            key={`${month}-${year}-${rowIndex}-${cellIndex}`}
                            style={[styles.calendarCell, !cell.isCurrent && styles.calendarCellInactive, isSelected && styles.calendarCellSelected]}
                            onPress={() => setSelectedCalendarCell(cell)}
                          >
                            <Text style={cell.isCurrent ? styles.calendarCellText : styles.calendarCellTextInactive}>
                              {cell.day}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
        <Text style={styles.calendarHint}>Tap on calendar to view logs for a given day</Text>
        {selectedCalendarCell && (
          <View style={styles.selectedDayLogsSection}>
            <Text style={styles.sectionTitle}>
              Logs for {selectedCalendarCell.month + 1}/{selectedCalendarCell.day}/{selectedCalendarCell.year}
            </Text>
            {selectedDayLogs.length === 0 ? (
              <Text style={styles.emptyText}>No logs for this day.</Text>
            ) : (
              selectedDayLogs.map((log) => (
                <View key={log.id} style={styles.logItem}>
                  <Text style={styles.logText}>{log.text}</Text>
                  <LogTags log={log} />
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Tag Selection Popup */}
      <Modal 
        visible={showTagPopup} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setShowTagPopup(false)}
      >
        <TouchableOpacity 
          style={styles.popupOverlay} 
          activeOpacity={1} 
          onPress={() => setShowTagPopup(false)}
        >
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>Add Tag</Text>
            <View style={styles.popupTagsGrid}>
              {editingLogId && ALL_TAGS.filter(tag => !logs.find(log => log.id === editingLogId)?.tags.includes(tag)).map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.popupTag}
                  onPress={() => addLogTag(editingLogId, tag)}
                >
                  <Text style={styles.popupTagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.popupCloseButton}
              onPress={() => setShowTagPopup(false)}
            >
              <Text style={styles.popupCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  inputBoxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, minHeight: 80 },
  inputBox: { flex: 1, minHeight: 80, maxHeight: 120, backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  submitButton: { marginLeft: 8, backgroundColor: '#4a90e2', borderRadius: 8, padding: 12, justifyContent: 'center', alignItems: 'center' },
  tagEditor: { marginBottom: 8 },
  tagEditorLabel: { fontWeight: 'bold', marginBottom: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  tag: { backgroundColor: '#eee', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, margin: 2 },
  tagSelected: { backgroundColor: '#4a90e2' },
  tagText: { color: '#333' },
  tagTextSelected: { color: '#fff', fontWeight: 'bold' },
  logsSplitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  logCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginHorizontal: 4, minHeight: 120 },
  logCardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 16 },
  logItem: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  logText: { fontSize: 16, marginBottom: 4 },
  logTag: { 
    backgroundColor: '#4a90e2', 
    borderRadius: 12, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    marginRight: 4, 
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  logTagText: { color: '#fff', fontSize: 12 },
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  analyticsCard: { width: '48%', aspectRatio: 1, backgroundColor: '#eaf1fb', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  analyticsCardTitle: { marginTop: 8, fontWeight: 'bold', color: '#4a90e2', fontSize: 15 },
  calendarSection: { marginTop: 8, marginBottom: 32 },
  calendarScrollView: { maxHeight: 400 },
  monthCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  calendarWeekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  calendarWeekDay: { width: 40, textAlign: 'center', color: '#888', fontWeight: 'bold' },
  calendarGrid: { 
    width: '100%',
  },
  calendarCell: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8, margin: 1, backgroundColor: '#fff' },
  calendarCellInactive: { backgroundColor: '#eee' },
  calendarCellSelected: { borderWidth: 2, borderColor: '#4a90e2' },
  calendarCellText: { color: '#333', fontWeight: 'bold' },
  calendarCellTextInactive: { color: '#bbb' },
  calendarHint: { color: '#888', fontSize: 12, marginTop: 8, textAlign: 'center' },
  selectedDayLogsSection: { marginTop: 8, backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  tagRemoveButton: { 
    backgroundColor: 'rgba(255, 255, 255, 0.3)', 
    borderRadius: 8, 
    paddingHorizontal: 4, 
    paddingVertical: 2, 
    marginLeft: 4 
  },
  tagRemoveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  addTagButton: { 
    backgroundColor: '#4a90e2', 
    borderRadius: 12, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    marginRight: 4, 
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24
  },
  addTagText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  popupContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%', maxHeight: '80%' },
  popupTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  popupTagsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  popupTag: { backgroundColor: '#4a90e2', borderRadius: 12, padding: 8, margin: 2 },
  popupTagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  popupCloseButton: { backgroundColor: '#4a90e2', borderRadius: 12, padding: 8, alignItems: 'center' },
  popupCloseText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

export default LoggingScreen; 