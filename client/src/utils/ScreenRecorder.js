/**
 * ScreenRecorder - Utility class for recording video sessions
 * Uses MediaRecorder API to capture and save video streams locally
 */
class ScreenRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.isRecording = false;
    }

    /**
     * Start recording a media stream
     * @param {MediaStream} stream - The stream to record
     * @param {Object} options - Recording options
     */
    startRecording(stream, options = {}) {
        if (this.isRecording) {
            console.warn('Recording is already in progress');
            return false;
        }

        try {
            this.stream = stream;
            this.recordedChunks = [];

            // Configure MediaRecorder
            const mimeType = this.getSupportedMimeType();
            const recorderOptions = {
                mimeType,
                videoBitsPerSecond: options.videoBitsPerSecond || 2500000, // 2.5 Mbps
                ...options
            };

            this.mediaRecorder = new MediaRecorder(stream, recorderOptions);

            // Handle data available event
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            // Handle stop event
            this.mediaRecorder.onstop = () => {
                console.log('Recording stopped, chunks:', this.recordedChunks.length);
            };

            // Handle error event
            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                this.isRecording = false;
            };

            // Start recording
            this.mediaRecorder.start(1000); // Collect data every second
            this.isRecording = true;

            console.log('Recording started with mimeType:', mimeType);
            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.isRecording = false;
            return false;
        }
    }

    /**
     * Stop recording and return the recorded blob
     * @returns {Promise<Blob>} The recorded video blob
     */
    stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.isRecording || !this.mediaRecorder) {
                reject(new Error('No active recording'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                const mimeType = this.mediaRecorder.mimeType;
                const blob = new Blob(this.recordedChunks, { type: mimeType });
                this.isRecording = false;
                console.log('Recording stopped, blob size:', blob.size);
                resolve(blob);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Download the recorded video
     * @param {string} filename - Name for the downloaded file
     */
    async downloadRecording(filename = 'video-call-recording') {
        try {
            const blob = await this.stopRecording();
            const url = URL.createObjectURL(blob);
            const extension = this.getFileExtension();

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${filename}-${Date.now()}.${extension}`;

            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            console.log('Recording downloaded:', a.download);
            return true;
        } catch (error) {
            console.error('Failed to download recording:', error);
            return false;
        }
    }

    /**
     * Pause the recording
     */
    pauseRecording() {
        if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            console.log('Recording paused');
            return true;
        }
        return false;
    }

    /**
     * Resume the recording
     */
    resumeRecording() {
        if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            console.log('Recording resumed');
            return true;
        }
        return false;
    }

    /**
     * Get the current recording state
     * @returns {string} The recording state
     */
    getState() {
        if (!this.mediaRecorder) return 'inactive';
        return this.mediaRecorder.state;
    }

    /**
     * Get supported MIME type for recording
     * @returns {string} Supported MIME type
     */
    getSupportedMimeType() {
        const types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm',
            'video/mp4'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'video/webm'; // Fallback
    }

    /**
     * Get file extension based on MIME type
     * @returns {string} File extension
     */
    getFileExtension() {
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
        if (mimeType.includes('mp4')) return 'mp4';
        return 'webm';
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.isRecording = false;
    }
}

export default ScreenRecorder;
