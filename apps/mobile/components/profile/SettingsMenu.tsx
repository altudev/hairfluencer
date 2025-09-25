import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isDestructive?: boolean;
}

interface SettingsMenuProps {
  menuItems: MenuItem[];
  isLoggingOut?: boolean;
}

export default function SettingsMenu({ menuItems, isLoggingOut = false }: SettingsMenuProps) {
  return (
    <View style={styles.settingsMenu}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.menuItem,
            index === menuItems.length - 1 && styles.menuItemLast,
          ]}
          onPress={item.onPress}
          disabled={item.id === 'logout' && isLoggingOut}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.isDestructive ? '#FF6B6B' : '#fff'}
          />
          <Text
            style={[
              styles.menuItemText,
              item.isDestructive && styles.menuItemTextDestructive,
            ]}
          >
            {item.id === 'logout' && isLoggingOut ? 'Signing Out...' : item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  settingsMenu: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: 'rgba(30,30,40,0.98)',
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    color: 'white',
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },
  menuItemTextDestructive: {
    color: '#FF6B6B',
  },
});

export type { MenuItem };