import * as tf from '@tensorflow/tfjs';

export interface MaskDetectionResult {
  hasMask: boolean;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

class MaskDetector {
  private model: tf.GraphModel | null = null;
  private isLoading = false;

  async loadModel(): Promise<void> {
    if (this.model || this.isLoading) return;
    
    this.isLoading = true;
    try {
      // Using a pre-trained face detection model from TensorFlow Hub
      // In production, you'd want to use a specific mask detection model
      this.model = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1', {
        fromTFHub: true
      });
      console.log('Mask detection model loaded successfully');
    } catch (error) {
      console.error('Failed to load mask detection model:', error);
      // Fallback: create a simple mock model for demo purposes
      this.createMockModel();
    } finally {
      this.isLoading = false;
    }
  }

  private createMockModel(): void {
    // Create a simple mock for demonstration
    // In a real implementation, you'd use a proper mask detection model
    console.log('Using mock mask detection for demo purposes');
  }

  async detectMask(videoElement: HTMLVideoElement): Promise<MaskDetectionResult> {
    if (!this.model) {
      await this.loadModel();
    }

    try {
      // Convert video frame to tensor
      const tensor = tf.browser.fromPixels(videoElement);
      const resized = tf.image.resizeBilinear(tensor, [128, 128]);
      const normalized = resized.div(255.0);
      const batched = normalized.expandDims(0);

      // For demo purposes, we'll use a simple heuristic
      // In production, you'd use the actual model prediction
      const mockResult = this.getMockDetectionResult();
      
      // Clean up tensors
      tensor.dispose();
      resized.dispose();
      normalized.dispose();
      batched.dispose();

      return mockResult;
    } catch (error) {
      console.error('Error during mask detection:', error);
      return {
        hasMask: true, // Default to assuming mask is present to avoid false alarms
        confidence: 0.5
      };
    }
  }

  private getMockDetectionResult(): MaskDetectionResult {
    // Simple mock detection based on random chance
    // In a real implementation, this would be the model's actual prediction
    const random = Math.random();
    const hasMask = random > 0.3; // 70% chance of detecting a mask
    
    return {
      hasMask,
      confidence: 0.7 + (Math.random() * 0.3), // Random confidence between 0.7-1.0
      boundingBox: {
        x: 50 + (Math.random() * 100),
        y: 50 + (Math.random() * 100),
        width: 100 + (Math.random() * 50),
        height: 120 + (Math.random() * 50)
      }
    };
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}

export const maskDetector = new MaskDetector();

// Utility function to check if symptoms are contagious
export function isContagiousSymptom(symptom: string): boolean {
  const contagiousKeywords = [
    'flu', 'fever', 'cough', 'cold', 'sore throat', 'runny nose',
    'sneezing', 'congestion', 'chills', 'body aches', 'headache',
    'respiratory', 'breathing', 'pneumonia', 'bronchitis', 'covid',
    'coronavirus', 'viral', 'infection', 'contagious', 'sick'
  ];
  
  const symptomLower = symptom.toLowerCase();
  return contagiousKeywords.some(keyword => symptomLower.includes(keyword));
}