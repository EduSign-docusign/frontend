import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';


export async function requestPhotoLibraryPerms() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    console.error('Permission to access camera roll was denied');
  }
}

// request camera permission
export async function requestCameraPerms() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    console.error('Permission to access camera was denied');
  }
}

export async function pickImage(handleImage, options = { allowsEditing: false }) {
  const { allowsEditing } = options;

  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
      allowsEditing: allowsEditing
    });

    if (!result.canceled) {
      console.log("Selected Image in ImagePicker:", result);

      const compressedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      handleImage(compressedImage);

      return compressedImage
    }
  } catch (error) {
    console.error("Error picking an image", error);
  }

};

export async function openCamera(handleImage) {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        console.log('Selected Image from Camera:', result);

        const compressedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Adjust the compression level as needed
        );

        handleImage(compressedImage);

        return compressedImage
      }
    } catch (error) {
      console.error('Error opening the camera', error);
    }
};

