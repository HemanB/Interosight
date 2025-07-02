import React, { useState } from 'react';
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

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
}

interface EmergencyContactsModalProps {
  visible: boolean;
  onClose: () => void;
}

const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  visible,
  onClose,
}) => {
  // Mock data - in real app this would come from storage/database
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      phoneNumber: '+1-555-0123',
      relationship: 'Therapist',
    },
    {
      id: '2',
      name: 'Mom',
      phoneNumber: '+1-555-0456',
      relationship: 'Parent',
    },
    {
      id: '3',
      name: 'Alex (Best Friend)',
      phoneNumber: '+1-555-0789',
      relationship: 'Friend',
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to make call');
    });
  };

  const handleText = (phoneNumber: string) => {
    Linking.openURL(`sms:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to send text');
    });
  };

  const handleFaceTime = (phoneNumber: string) => {
    Linking.openURL(`facetime:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to start FaceTime');
    });
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleRemoveContact = (contactId: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setContacts(contacts.filter(contact => contact.id !== contactId));
          },
        },
      ]
    );
  };

  const handleAddContact = () => {
    Alert.alert(
      'Add Contact',
      'This feature will allow you to add new emergency contacts. For now, this is a placeholder.',
      [{ text: 'OK' }]
    );
  };

  const ContactCard: React.FC<{ contact: EmergencyContact }> = ({ contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactRelationship}>{contact.relationship}</Text>
        <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={() => handleCall(contact.phoneNumber)}
        >
          <Ionicons name="call" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.textButton]}
          onPress={() => handleText(contact.phoneNumber)}
        >
          <Ionicons name="chatbubble" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.facetimeButton]}
          onPress={() => handleFaceTime(contact.phoneNumber)}
        >
          <Ionicons name="videocam" size={20} color="white" />
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemoveContact(contact.id)}
          >
            <Ionicons name="trash" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
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
          <Text style={styles.title}>Emergency Contacts</Text>
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Text style={styles.editButtonText}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {contacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Emergency Contacts</Text>
              <Text style={styles.emptyStateText}>
                Add emergency contacts to get quick access to support when you need it.
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
                <Text style={styles.addButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Emergency Contacts</Text>
                <Text style={styles.sectionSubtitle}>
                  Tap the buttons to call, text, or FaceTime your contacts
                </Text>
              </View>

              {contacts.map(contact => (
                <ContactCard key={contact.id} contact={contact} />
              ))}

              {isEditing && (
                <TouchableOpacity style={styles.addContactCard} onPress={handleAddContact}>
                  <View style={styles.addContactContent}>
                    <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                    <Text style={styles.addContactText}>Add New Contact</Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            In case of emergency, call 911 or your local emergency services immediately.
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
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
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
  contactCard: {
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
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  textButton: {
    backgroundColor: '#2196F3',
  },
  facetimeButton: {
    backgroundColor: '#9C27B0',
  },
  removeButton: {
    backgroundColor: '#F44336',
  },
  addContactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  addContactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addContactText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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

export default EmergencyContactsModal; 