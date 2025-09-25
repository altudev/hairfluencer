import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export interface Template {
  id: string;
  image: string;
  title: string;
}

interface TemplateGridProps {
  templates: Template[];
  onTemplatePress?: (template: Template) => void;
}

export default function TemplateGrid({ templates, onTemplatePress }: TemplateGridProps) {
  const renderTemplate = (item: Template) => (
    <TouchableOpacity
      key={item.id}
      style={styles.templateCard}
      activeOpacity={0.8}
      onPress={() => onTemplatePress?.(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.templateImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.templateGradient}
      >
        <TouchableOpacity style={styles.tryButton}>
          <Feather name="play-circle" size={20} color="white" />
          <Text style={styles.tryText}>Try</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.templatesGrid}>
      {templates.map((template) => (
        <View key={template.id} style={styles.templateWrapper}>
          {renderTemplate(template)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  templateCard: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  templateGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  tryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});