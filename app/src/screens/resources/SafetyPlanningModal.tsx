import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

interface SafetyPlan {
  warningSigns: string[];
  copingStrategies: string[];
  socialContacts: string[];
  professionalContacts: string[];
  safeEnvironments: string[];
  emergencyPlan: string;
}

interface SafetyPlanningModalProps {
  visible: boolean;
  onClose: () => void;
}

const SafetyPlanningModal: React.FC<SafetyPlanningModalProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>({
    warningSigns: [],
    copingStrategies: [],
    socialContacts: [],
    professionalContacts: [],
    safeEnvironments: [],
    emergencyPlan: '',
  });
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Load safety plan from Firestore when modal opens
  useEffect(() => {
    const fetchPlan = async () => {
      if (visible && user) {
        setLoading(true);
        try {
          const docRef = doc(db, 'safetyPlans', user.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSafetyPlan({
              warningSigns: data.warningSigns || [],
              copingStrategies: data.copingStrategies || [],
              socialContacts: data.socialContacts || [],
              professionalContacts: data.professionalContacts || [],
              safeEnvironments: data.safeEnvironments || [],
              emergencyPlan: data.emergencyPlan || '',
            });
          } else {
            setSafetyPlan({
              warningSigns: [],
              copingStrategies: [],
              socialContacts: [],
              professionalContacts: [],
              safeEnvironments: [],
              emergencyPlan: '',
            });
          }
        } catch (error) {
          console.error('Failed to fetch safety plan:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPlan();
    // Reset to summary view when modal opens
    setIsEditMode(false);
    setCurrentStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, user]);

  const steps = [
    {
      title: 'Warning Signs',
      description: 'What are your early warning signs that you might be heading toward a crisis?',
      placeholder: 'e.g., feeling overwhelmed, isolating myself, negative thoughts...',
      field: 'warningSigns' as keyof SafetyPlan,
    },
    {
      title: 'Coping Strategies',
      description: 'What strategies help you feel better when you\'re struggling?',
      placeholder: 'e.g., deep breathing, calling a friend, going for a walk...',
      field: 'copingStrategies' as keyof SafetyPlan,
    },
    {
      title: 'Social Contacts',
      description: 'Who can you reach out to for support?',
      placeholder: 'e.g., best friend, family member, support group...',
      field: 'socialContacts' as keyof SafetyPlan,
    },
    {
      title: 'Professional Contacts',
      description: 'What professional resources can you contact?',
      placeholder: 'e.g., therapist, crisis hotline, doctor...',
      field: 'professionalContacts' as keyof SafetyPlan,
    },
    {
      title: 'Safe Environments',
      description: 'Where do you feel safe and supported?',
      placeholder: 'e.g., my room, the library, a friend\'s house...',
      field: 'safeEnvironments' as keyof SafetyPlan,
    },
    {
      title: 'Emergency Plan',
      description: 'What will you do if you\'re in immediate danger?',
      placeholder: 'e.g., call 911, go to the emergency room, contact my therapist...',
      field: 'emergencyPlan' as keyof SafetyPlan,
    },
  ];

  const handleAddItem = () => {
    if (inputText.trim()) {
      const currentField = steps[currentStep].field;
      if (currentField === 'emergencyPlan') {
        setSafetyPlan(prev => ({
          ...prev,
          emergencyPlan: inputText.trim(),
        }));
      } else {
        setSafetyPlan(prev => ({
          ...prev,
          [currentField]: [...(prev[currentField] as string[]), inputText.trim()],
        }));
      }
      setInputText('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const currentField = steps[currentStep].field;
    if (currentField !== 'emergencyPlan') {
      setSafetyPlan(prev => ({
        ...prev,
        [currentField]: (prev[currentField] as string[]).filter((_, i) => i !== index),
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSavePlan();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSavePlan = async () => {
    if (!user) {
      Alert.alert('Not signed in', 'You must be signed in to save your safety plan.');
      return;
    }
    
    console.log('User ID:', user.id);
    console.log('Safety Plan Data:', safetyPlan);
    
    try {
      const planData = {
        ...safetyPlan,
        updatedAt: new Date().toISOString(),
        userId: user.id,
      };
      
      console.log('Saving plan data:', planData);
      
      await setDoc(doc(db, 'safetyPlans', user.id), planData);
      
      console.log('Safety plan saved successfully, closing modal...');
      
      // Close the modal immediately after successful save
      onClose();
      
      // Show success message after closing
      setTimeout(() => {
        Alert.alert(
          'Safety Plan Saved',
          'Your safety plan has been saved to your account.'
        );
      }, 100);
    } catch (error: any) {
      console.error('Firestore save error:', error);
      Alert.alert('Error', `Failed to save your safety plan: ${error.message}`);
    }
  };

  const handleStartEdit = () => {
    setIsEditMode(true);
    setCurrentStep(0);
  };

  const handleBackToSummary = () => {
    setIsEditMode(false);
    setCurrentStep(0);
  };

  const hasPlanData = () => {
    return (
      safetyPlan.warningSigns.length > 0 ||
      safetyPlan.copingStrategies.length > 0 ||
      safetyPlan.socialContacts.length > 0 ||
      safetyPlan.professionalContacts.length > 0 ||
      safetyPlan.safeEnvironments.length > 0 ||
      safetyPlan.emergencyPlan
    );
  };

  const renderSummaryView = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Your Safety Plan</Text>
        <Text style={styles.summarySubtitle}>
          {hasPlanData() 
            ? 'Here\'s your current safety plan. Tap edit to make changes.'
            : 'Create your personalized safety plan for crisis moments.'
          }
        </Text>
      </View>

      {!hasPlanData() ? (
        <View style={styles.emptyState}>
          <Ionicons name="shield-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Safety Plan Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first safety plan to help you during difficult moments.
          </Text>
        </View>
      ) : (
        <View style={styles.summaryContent}>
          {safetyPlan.warningSigns.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>⚠️ Warning Signs</Text>
              <View style={styles.summaryItems}>
                {safetyPlan.warningSigns.slice(0, 3).map((sign, index) => (
                  <Text key={index} style={styles.summaryItem}>• {sign}</Text>
                ))}
                {safetyPlan.warningSigns.length > 3 && (
                  <Text style={styles.summaryMore}>+{safetyPlan.warningSigns.length - 3} more</Text>
                )}
              </View>
            </View>
          )}

          {safetyPlan.copingStrategies.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>🛠️ Coping Strategies</Text>
              <View style={styles.summaryItems}>
                {safetyPlan.copingStrategies.slice(0, 3).map((strategy, index) => (
                  <Text key={index} style={styles.summaryItem}>• {strategy}</Text>
                ))}
                {safetyPlan.copingStrategies.length > 3 && (
                  <Text style={styles.summaryMore}>+{safetyPlan.copingStrategies.length - 3} more</Text>
                )}
              </View>
            </View>
          )}

          {safetyPlan.socialContacts.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>👥 Social Contacts</Text>
              <View style={styles.summaryItems}>
                {safetyPlan.socialContacts.slice(0, 2).map((contact, index) => (
                  <Text key={index} style={styles.summaryItem}>• {contact}</Text>
                ))}
                {safetyPlan.socialContacts.length > 2 && (
                  <Text style={styles.summaryMore}>+{safetyPlan.socialContacts.length - 2} more</Text>
                )}
              </View>
            </View>
          )}

          {safetyPlan.professionalContacts.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>🏥 Professional Contacts</Text>
              <View style={styles.summaryItems}>
                {safetyPlan.professionalContacts.slice(0, 2).map((contact, index) => (
                  <Text key={index} style={styles.summaryItem}>• {contact}</Text>
                ))}
                {safetyPlan.professionalContacts.length > 2 && (
                  <Text style={styles.summaryMore}>+{safetyPlan.professionalContacts.length - 2} more</Text>
                )}
              </View>
            </View>
          )}

          {safetyPlan.safeEnvironments.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>🏠 Safe Environments</Text>
              <View style={styles.summaryItems}>
                {safetyPlan.safeEnvironments.slice(0, 2).map((environment, index) => (
                  <Text key={index} style={styles.summaryItem}>• {environment}</Text>
                ))}
                {safetyPlan.safeEnvironments.length > 2 && (
                  <Text style={styles.summaryMore}>+{safetyPlan.safeEnvironments.length - 2} more</Text>
                )}
              </View>
            </View>
          )}

          {safetyPlan.emergencyPlan && (
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>🚨 Emergency Plan</Text>
              <View style={styles.emergencyPlanSummary}>
                <Text style={styles.emergencyPlanText}>{safetyPlan.emergencyPlan}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.summaryActions}>
        <TouchableOpacity style={styles.editButton} onPress={handleStartEdit}>
          <Ionicons name="create" size={20} color="white" />
          <Text style={styles.editButtonText}>
            {hasPlanData() ? 'Edit Plan' : 'Create Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStepContent = () => {
    const step = steps[currentStep];
    const currentItems = safetyPlan[step.field] as string[];

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepDescription}>{step.description}</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={step.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.addButton, !inputText.trim() && styles.addButtonDisabled]}
            onPress={handleAddItem}
            disabled={!inputText.trim()}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {step.field !== 'emergencyPlan' && currentItems.length > 0 && (
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsTitle}>Your {step.title}:</Text>
            {currentItems.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <Text style={styles.itemText}>{item}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {step.field === 'emergencyPlan' && safetyPlan.emergencyPlan && (
          <View style={styles.emergencyPlanContainer}>
            <Text style={styles.itemsTitle}>Your Emergency Plan:</Text>
            <View style={styles.emergencyPlanCard}>
              <Text style={styles.emergencyPlanText}>{safetyPlan.emergencyPlan}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditMode ? 'Safety Planning' : 'Safety Plan'}
          </Text>
          {isEditMode && (
            <TouchableOpacity onPress={handleBackToSummary} style={styles.backButton}>
              <Text style={styles.backButtonText}>Summary</Text>
            </TouchableOpacity>
          )}
          {!isEditMode && <View style={styles.placeholder} />}
        </View>

        {/* Progress Bar - only show in edit mode */}
        {isEditMode && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / steps.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep + 1} of {steps.length}
            </Text>
          </View>
        )}

        {/* Content */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#888', fontSize: 16 }}>Loading your safety plan...</Text>
          </View>
        ) : isEditMode ? (
          <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
              </View>

              {renderStepContent()}

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#007AFF" />
                <Text style={styles.infoText}>
                  This safety plan is for you to use when you're feeling overwhelmed or in crisis. 
                  Take your time and be honest with yourself.
                </Text>
              </View>
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
                onPress={handlePrevious}
                disabled={currentStep === 0}
              >
                <Ionicons name="chevron-back" size={20} color={currentStep === 0 ? "#ccc" : "#007AFF"} />
                <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 ? 'Save Plan' : 'Next'}
                </Text>
                <Ionicons 
                  name={currentStep === steps.length - 1 ? "checkmark" : "chevron-forward"} 
                  size={20} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          renderSummaryView()
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  stepContent: {
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginRight: 12,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  itemsContainer: {
    marginTop: 20,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  removeButton: {
    padding: 4,
  },
  emergencyPlanContainer: {
    marginTop: 20,
  },
  emergencyPlanCard: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEAA7',
    borderRadius: 8,
    padding: 16,
  },
  emergencyPlanText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
    marginLeft: 8,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  summaryHeader: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
  },
  summaryContent: {
    marginBottom: 20,
  },
  summarySection: {
    marginBottom: 20,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  summaryItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    fontSize: 14,
    color: '#2c3e50',
    marginRight: 8,
  },
  summaryMore: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emergencyPlanSummary: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEAA7',
    borderRadius: 8,
    padding: 16,
  },
  summaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default SafetyPlanningModal; 