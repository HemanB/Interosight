import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CrisisHotline {
  id: string;
  name: string;
  phoneNumber: string;
  description: string;
  available: string;
}

interface CrisisHotlinesModalProps {
  visible: boolean;
  onClose: () => void;
}

const CrisisHotlinesModal: React.FC<CrisisHotlinesModalProps> = ({
  visible,
  onClose,
}) => {
  // Predefined crisis hotlines - these cannot be edited
  const crisisHotlines: CrisisHotline[] = [
    {
      id: '1',
      name: 'National Suicide Prevention Lifeline',
      phoneNumber: '988',
      description: 'Free, confidential support for people in distress',
      available: '24/7',
    },
    {
      id: '2',
      name: 'Crisis Text Line',
      phoneNumber: '741741',
      description: 'Text HOME to connect with a crisis counselor',
      available: '24/7',
    },
    {
      id: '3',
      name: 'National Eating Disorders Association (NEDA)',
      phoneNumber: '1-800-931-2237',
      description: 'Support for eating disorders and body image issues',
      available: 'Mon-Thu 9AM-9PM ET, Fri 9AM-5PM ET',
    },
    {
      id: '4',
      name: 'SAMHSA National Helpline',
      phoneNumber: '1-800-662-4357',
      description: 'Treatment referral and information for mental health and substance use',
      available: '24/7',
    },
    {
      id: '5',
      name: 'Trevor Project (LGBTQ+)',
      phoneNumber: '1-866-488-7386',
      description: 'Crisis intervention and suicide prevention for LGBTQ+ youth',
      available: '24/7',
    },
    {
      id: '6',
      name: 'Veterans Crisis Line',
      phoneNumber: '1-800-273-8255',
      description: 'Confidential support for veterans and their families',
      available: '24/7',
    },
    {
      id: '7',
      name: 'RAINN Sexual Assault Hotline',
      phoneNumber: '1-800-656-4673',
      description: 'Support for survivors of sexual assault',
      available: '24/7',
    },
    {
      id: '8',
      name: 'National Domestic Violence Hotline',
      phoneNumber: '1-800-799-7233',
      description: 'Support for domestic violence survivors',
      available: '24/7',
    },
  ];

  const handleCall = (hotline: CrisisHotline) => {
    Alert.alert(
      `Call ${hotline.name}`,
      `Are you sure you want to call ${hotline.name}?\n\n${hotline.phoneNumber}\n\n${hotline.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          style: 'default',
          onPress: () => {
            Linking.openURL(`tel:${hotline.phoneNumber}`).catch(() => {
              Alert.alert('Error', 'Unable to make call');
            });
          },
        },
      ]
    );
  };

  const HotlineCard: React.FC<{ hotline: CrisisHotline }> = ({ hotline }) => (
    <View style={styles.hotlineCard}>
      <View style={styles.hotlineInfo}>
        <Text style={styles.hotlineName}>{hotline.name}</Text>
        <Text style={styles.hotlinePhone}>{hotline.phoneNumber}</Text>
        <Text style={styles.hotlineDescription}>{hotline.description}</Text>
        <View style={styles.availabilityContainer}>
          <Ionicons name="time-outline" size={14} color="#4CAF50" />
          <Text style={styles.availabilityText}>{hotline.available}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.callButton}
        onPress={() => handleCall(hotline)}
      >
        <Ionicons name="call" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.title}>Crisis Hotlines</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#FF6B6B" />
            <Text style={styles.warningText}>
              If you're in immediate danger, call 911 or your local emergency services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>24/7 Crisis Support</Text>
            <Text style={styles.sectionSubtitle}>
              These hotlines provide free, confidential support when you need it most.
            </Text>
          </View>

          {crisisHotlines.map(hotline => (
            <HotlineCard key={hotline.id} hotline={hotline} />
          ))}

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>What to expect when you call:</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.infoText}>Confidential and anonymous support</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.infoText}>Trained crisis counselors</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.infoText}>No judgment or pressure</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.infoText}>Resources and referrals</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These hotlines are not affiliated with InteroSight. 
            For medical emergencies, always call 911.
          </Text>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEAA7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  hotlineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotlineInfo: {
    flex: 1,
  },
  hotlineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  hotlinePhone: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 6,
  },
  hotlineDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 8,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CrisisHotlinesModal; 