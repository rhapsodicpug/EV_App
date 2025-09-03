import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, ImageStyle } from 'react-native';

interface OptimizedImageProps {
  source: ImageSourcePropType;
  style?: ImageStyle;
  placeholder?: ImageSourcePropType;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
  resizeMode = 'cover',
  onLoad,
  onError,
}) => {
  const [imageSource, setImageSource] = React.useState<ImageSourcePropType>(placeholder || source);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simple fallback without external caching library
    setImageSource(source);
    setIsLoading(false);
  }, [source]);

  return (
    <Image
      source={imageSource}
      style={[styles.image, style]}
      resizeMode={resizeMode}
      onLoad={() => {
        setIsLoading(false);
        onLoad?.();
      }}
      onError={() => {
        setIsLoading(false);
        onError?.();
      }}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

export default OptimizedImage;
