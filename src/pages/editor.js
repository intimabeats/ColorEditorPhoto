
import { getLUTs } from '../services/storage.js';
import { applyLUT, generatePreview } from '../services/imageProcessor.js';
import { saveEditedImage } from '../services/storage.js';

// Variáveis para armazenar o estado do editor
let currentImage = null;