import type { Options, DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel, TypeNumber } from 'qr-code-styling';

export interface QRGeneratorOptions {
  // Required
  data: string;
  
  // Size options
  width?: number;
  height?: number;
  margin?: number;
  
  // Style options
  dotType?: DotType;
  cornerSquareType?: CornerSquareType;
  cornerDotType?: CornerDotType;
  foregroundColor?: string;
  backgroundColor?: string;
  
  // QR code options
  errorCorrectionLevel?: ErrorCorrectionLevel;
  typeNumber?: TypeNumber;
  
  // Logo/Image options
  image?: string; // Data URL or image URL
  imageSize?: number; // 0.0 to 1.0
  imageMargin?: number;
  hideBackgroundDots?: boolean;
}

const defaultOptions: Required<Omit<QRGeneratorOptions, 'data' | 'image'>> & Pick<QRGeneratorOptions, 'image'> = {
  width: 400,
  height: 400,
  margin: 0,
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  typeNumber: 0,
  imageSize: 0.3,
  imageMargin: 5,
  hideBackgroundDots: true,
  image: undefined,
};

/**
 * Generate QR Code with customizable options
 * @param data - String data to encode in QR code
 * @param customOptions - Optional customization options
 * @returns QRCodeStyling instance
 */
export async function generateQRCode(
  data: string,
  customOptions?: Partial<QRGeneratorOptions>
): Promise<any> {
  // Dynamically import qr-code-styling
  const QRCodeStylingModule = await import('qr-code-styling');
  const QRCodeStyling = QRCodeStylingModule.default;

  // Merge default options with custom options
  const options = { ...defaultOptions, ...customOptions, data };

  // Create QR code styling options
  const qrOptions: Partial<Options> = {
    width: options.width,
    height: options.height,
    data: options.data,
    margin: options.margin,
    qrOptions: {
      typeNumber: options.typeNumber,
      mode: 'Byte' as const,
      errorCorrectionLevel: options.errorCorrectionLevel,
    },
    imageOptions: {
      hideBackgroundDots: options.hideBackgroundDots,
      imageSize: options.imageSize,
      margin: options.imageMargin,
    },
    dotsOptions: {
      type: options.dotType,
      color: options.foregroundColor,
    },
    backgroundOptions: {
      color: options.backgroundColor,
    },
    cornersSquareOptions: {
      type: options.cornerSquareType,
      color: options.foregroundColor,
    },
    cornersDotOptions: {
      type: options.cornerDotType,
      color: options.foregroundColor,
    },
    image: options.image,
  };

  return new QRCodeStyling(qrOptions);
}

/**
 * Generate and download QR Code
 * @param data - String data to encode in QR code
 * @param options - Optional customization options
 * @param fileName - File name for download (without extension)
 * @param extension - File extension ('png', 'svg', 'jpeg')
 */
export async function generateAndDownloadQRCode(
  data: string,
  options?: Partial<QRGeneratorOptions>,
  fileName: string = `qr-code-${Date.now()}`,
  extension: 'png' | 'svg' | 'jpeg' = 'png'
): Promise<void> {
  const qrCode = await generateQRCode(data, options);
  await qrCode.download({ name: fileName, extension });
}

/**
 * Generate QR Code and get as Blob
 * @param data - String data to encode in QR code
 * @param options - Optional customization options
 * @param extension - File extension ('png', 'svg', 'jpeg')
 * @returns Blob of QR code image
 */
export async function generateQRCodeBlob(
  data: string,
  options?: Partial<QRGeneratorOptions>,
  extension: 'png' | 'svg' | 'jpeg' = 'png'
): Promise<Blob | null> {
  const qrCode = await generateQRCode(data, options);
  return await qrCode.getRawData(extension);
}

/**
 * Generate QR Code and append to DOM element
 * @param data - String data to encode in QR code
 * @param container - HTML element to append QR code to
 * @param options - Optional customization options
 * @returns QRCodeStyling instance
 */
export async function generateQRCodeToElement(
  data: string,
  container: HTMLElement,
  options?: Partial<QRGeneratorOptions>
): Promise<any> {
  const qrCode = await generateQRCode(data, options);
  container.innerHTML = '';
  qrCode.append(container);
  return qrCode;
}

/**
 * Update existing QR Code instance
 * @param qrCodeInstance - Existing QRCodeStyling instance
 * @param data - New string data
 * @param options - Optional customization options
 */
export function updateQRCode(
  qrCodeInstance: any,
  data: string,
  options?: Partial<QRGeneratorOptions>
): void {
  const mergedOptions = { ...defaultOptions, ...options, data };
  
  const qrOptions: Partial<Options> = {
    width: mergedOptions.width,
    height: mergedOptions.height,
    data: mergedOptions.data,
    margin: mergedOptions.margin,
    qrOptions: {
      typeNumber: mergedOptions.typeNumber,
      mode: 'Byte' as const,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    },
    imageOptions: {
      hideBackgroundDots: mergedOptions.hideBackgroundDots,
      imageSize: mergedOptions.imageSize,
      margin: mergedOptions.imageMargin,
    },
    dotsOptions: {
      type: mergedOptions.dotType,
      color: mergedOptions.foregroundColor,
    },
    backgroundOptions: {
      color: mergedOptions.backgroundColor,
    },
    cornersSquareOptions: {
      type: mergedOptions.cornerSquareType,
      color: mergedOptions.foregroundColor,
    },
    cornersDotOptions: {
      type: mergedOptions.cornerDotType,
      color: mergedOptions.foregroundColor,
    },
    image: mergedOptions.image,
  };
  
  qrCodeInstance.update(qrOptions);
}
