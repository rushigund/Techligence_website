// mediapipe_pose_controller.js

import { PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js";

export class MediaPipeHandController { // Consider renaming this to MediaPipePoseController for clarity
    constructor(viewerInstance, webcamElement) {
        this.viewer = viewerInstance;
        this.webcamElement = webcamElement; // The original webcam video element
        this.uploadedVideoElement = document.getElementById('uploadedVideo'); // New: Reference to uploaded video element
        this.videoInput = document.getElementById('videoInput'); // New: Reference to video file input
        this.playVideoButton = document.getElementById('playVideoButton'); // New: Reference to play video button
        this.useWebcamButton = document.getElementById('useWebcamButton'); // New: Reference to use webcam button
        this.pauseVideoButton = document.getElementById('pauseVideoButton'); // NEW: Reference to pause video button
        this.videoWrapper = document.getElementById('videoWrapper'); // New: Reference to video input wrapper

        this.currentVideoSource = 'webcam'; // 'webcam' or 'uploaded'
        this.video = this.webcamElement; // This will point to the active video source

        this.poseLandmarker = null;
        this.runningMode = "VIDEO";
        this.webcamInitialized = false;
        this.lastVideoTime = -1;
        this.animationFrameId = null; // To store the ID of the requestAnimationFrame
        this.videoStream = null; // To store the webcam stream for stopping it

        // Store previous joint values for smoothing
        this.previousJointValues = {};
        this.debugMode = true; // Keep debugMode enabled for detailed logs during testing
         
         this.POSE = {
            NOSE: 0,
            LEFT_EYE_INNER: 1,
            LEFT_EYE: 2,
            LEFT_EYE_OUTER: 3,
            RIGHT_EYE_INNER: 4,
            RIGHT_EYE: 5,
            RIGHT_EYE_OUTER: 6,
            LEFT_EAR: 7,
            RIGHT_EAR: 8,
            MOUTH_LEFT: 9,
            MOUTH_RIGHT: 10,
            LEFT_SHOULDER: 11,
            RIGHT_SHOULDER: 12,
            LEFT_ELBOW: 13,
            RIGHT_ELBOW: 14,
            LEFT_WRIST: 15,
            RIGHT_WRIST: 16,
            LEFT_PINKY_KNUCKLE: 17,
            RIGHT_PINKY_KNUCKLE: 18,
            LEFT_INDEX_KNUCKLE: 19,
            RIGHT_INDEX_KNUCKLE: 20,
            LEFT_THUMB_KNUCKLE: 21,
            RIGHT_THUMB_KNUCKLE: 22,
            LEFT_HIP: 23,
            RIGHT_HIP: 24,
            LEFT_KNEE: 25,
            RIGHT_KNEE: 26,
            LEFT_ANKLE: 27,
            RIGHT_ANKLE: 28,
            LEFT_HEEL: 29,
            RIGHT_HEEL: 30,
            LEFT_FOOT_INDEX: 31,
            RIGHT_FOOT_INDEX: 32
        };


        // Define the robot's initial (default) pose for all controlled joints
        this.initialRobotPose = {
    // Existing arm and head joints (confirm their initial values are correct for a default pose)
    'l_shoulder_x': 0,
    'l_shoulder_y': 0,
    'l_arm_z': 0,
    'l_elbow_y': 0, // Straight position for left elbow
    'r_shoulder_x': 0,
    'r_shoulder_y': 0,
    'r_arm_z': 0,
    'r_elbow_y': 0, // Straight position for right elbow
    'head_z': 0,
    'head_y': 0,
    // Existing leg joints
    'r_hip_y': 0, // Added for right leg
    'r_knee_y': 0, // Added for right leg
    'l_hip_y': 0, // Added for left leg
    'l_knee_y': 0, // Added for left leg

    // --- NEW: Torso (ABS) and Base Joints ---
    'abs_x': 0.0, // Initial value for side bend (0.0 for no bend)
    'abs_y': 0.0, // Initial value for forward/backward lean (0.0 for upright)
    'abs_z': 0.0, // Initial value for torso twist (0.0 for no twist)

    'base_x': 0.0, // Initial horizontal position (0.0 for centered)
    'base_y': 0.0, // Initial vertical position (0.0 for neutral/ground)
    'base_z': 0.0, // Initial depth position (0.0 for neutral depth)
};

        // History for arm length for foreshortening detection
        this.armLengthHistory_L = [];
        this.armLengthHistory_R = [];

        this.initMediaPipe();
        this.addEventListeners(); // New: Call to add event listeners
    }

    async initMediaPipe() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "/mediapipe_models/pose_landmarker_heavy.task",
                delegate: "GPU"
            },
            runningMode: this.runningMode,
            numPoses: 1 // Only need to detect one person
        });

        console.log("MediaPipe PoseLandmarker initialized.");
        this.setupWebcam(); // Start with webcam by default
    }

    addEventListeners() {
        // Handle URDF viewer events (if any, not directly related to mediapipe control)
        // For video upload
        this.videoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.uploadedVideoElement.src = URL.createObjectURL(file);
                this.playVideoButton.disabled = false;
                this.pauseVideoButton.disabled = true; 
                this.videoWrapper.classList.add('has-files');
                this.viewer.updateStatus(`Video '${file.name}' loaded. Click Play Video.`, 'success');
            } else {
                this.playVideoButton.disabled = true;
                this.pauseVideoButton.disabled = true;
                this.videoWrapper.classList.remove('has-files');
                this.viewer.updateStatus('No video file selected.', 'error');
            }
        });

        this.playVideoButton.addEventListener('click', () => {
            if (this.uploadedVideoElement.src) {
                this.stopCurrentVideoSource();
                this.currentVideoSource = 'uploaded';
                this.video = this.uploadedVideoElement;
                this.webcamElement.style.display = 'none';
                this.uploadedVideoElement.style.display = 'block';
                this.uploadedVideoElement.play();
                this.pauseVideoButton.disabled = false;
                this.playVideoButton.disabled = true;
                this.viewer.updateStatus('Playing uploaded video...', 'loading');
                this.detectPosesInRealTime(); // Start detection for video
            }
        });

        this.pauseVideoButton.addEventListener('click', () => {
            if (this.currentVideoSource === 'uploaded' && !this.uploadedVideoElement.paused) {
                this.uploadedVideoElement.pause();
                // When paused, stop the animation frame to halt pose detection
                if (this.animationFrameId) {
                    cancelAnimationFrame(this.animationFrameId);
                    this.animationFrameId = null;
                }
                this.playVideoButton.disabled = false; // Enable play when paused
                this.pauseVideoButton.disabled = true; // Disable pause when paused
                this.viewer.updateStatus('Video paused. Click Play to resume.', 'loading');
            }
        });


        this.uploadedVideoElement.addEventListener('play', () => {
            this.viewer.updateStatus('Video playing, mimicking motion.', 'success');
        });

        this.uploadedVideoElement.addEventListener('ended', () => {
            this.viewer.updateStatus('Video finished. Resetting robot.', 'success');
            this.resetRobotToInitialPose();
            this.drawLandmarks([]); // Clear overlay
            // Optionally, switch back to webcam or remain paused
            // this.setupWebcam(); 
        });

        this.uploadedVideoElement.addEventListener('pause', () => {
            this.viewer.updateStatus('Video paused.', 'loading');
        });

        this.uploadedVideoElement.addEventListener('error', (e) => {
            console.error('Error playing uploaded video:', e);
            this.viewer.updateStatus('Error playing video. Try another file.', 'error');
            this.resetRobotToInitialPose();
        });


        this.useWebcamButton.addEventListener('click', () => {
            this.stopCurrentVideoSource();
            this.currentVideoSource = 'webcam';
            this.video = this.webcamElement;
            this.uploadedVideoElement.style.display = 'none';
            this.webcamElement.style.display = 'block';
            this.setupWebcam(); // Re-initialize webcam
            this.viewer.updateStatus('Switching to webcam...', 'loading');
        });
    }

    stopCurrentVideoSource() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (this.currentVideoSource === 'webcam' && this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.webcamElement.srcObject = null;
            this.webcamInitialized = false;
        } else if (this.currentVideoSource === 'uploaded' && !this.uploadedVideoElement.paused) {
            this.uploadedVideoElement.pause();
            this.uploadedVideoElement.currentTime = 0; // Reset video to start
        }
        this.resetRobotToInitialPose(); // Reset robot pose when switching/stopping
        this.drawLandmarks([]); // Clear overlay
        this.playVideoButton.disabled = true;
        this.pauseVideoButton.disabled = true;
    }


    setupWebcam() {
        if (this.webcamInitialized && this.video.srcObject) { // Already initialized and running
            console.log("Webcam already initialized.");
            this.viewer.updateStatus("Webcam active. Mimicking motion.", 'success');
            if (!this.animationFrameId) { // Ensure detection loop is running
                this.detectPosesInRealTime();
            }
            return;
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    this.videoStream = stream; // Store the stream
                    this.webcamElement.srcObject = stream;
                    this.webcamElement.addEventListener("canplay", () => {
                        this.webcamElement.play(); // Ensure webcam video plays
                        this.overlayCanvas = document.getElementById("overlay");
                        this.overlayCanvas.width = this.webcamElement.videoWidth;
                        this.overlayCanvas.height = this.webcamElement.videoHeight;
                        this.overlayCtx = this.overlayCanvas.getContext("2d");

                        this.webcamInitialized = true;
                        this.viewer.updateStatus("Webcam stream started. Starting pose detection.", 'success');
                        console.log("Webcam stream started. Starting pose detection loop.");
                        this.detectPosesInRealTime();
                    }, { once: true });
                })
                .catch((error) => {
                    console.error("Error accessing webcam:", error);
                    this.viewer.updateStatus("Error accessing webcam: " + error.message, 'error');
                });
        } else {
            this.viewer.updateStatus("Webcam not supported by this browser.", 'error');
        }
    }

  async detectPosesInRealTime() {
    if (this.video.paused || this.video.ended) {
        // Stop processing if video is paused or ended
        this.animationFrameId = null;
        return;
    }

    // Only detect if video (webcam or uploaded) is ready and has new frame
    if (this.videoInitialized && this.video.currentTime !== this.lastVideoTime) { // Check this.videoInitialized
        this.lastVideoTime = this.video.currentTime;

        // Check if the video element has valid dimensions before proceeding
        if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
            if (this.debugMode) console.log("Video element has zero dimensions, skipping detection.");
            this.animationFrameId = requestAnimationFrame(this.detectPosesInRealTime.bind(this));
            return;
        }

        const startTimeMs = performance.now();

        try {
            const result = await this.poseLandmarker.detectForVideo(this.video, startTimeMs);
            if (result.landmarks) {
                if (this.debugMode) console.log(`Detected landmarks count: ${result.landmarks.length > 0 ? result.landmarks[0].length : 0}`);
            } else {
                if (this.debugMode) console.log('No landmarks object in result.');
            }

            if (result.landmarks && result.landmarks.length > 0) {
                const poseLandmarks = result.landmarks[0];

                // --- Debugging: Directly print poseLandmarks if debugMode is true ---
                if (this.debugMode) { // Only log if debugMode is true
                    console.log("--- Contents of poseLandmarks (result.landmarks[0]) ---");
                    console.log(poseLandmarks);
                    console.log("--------------------------------------------------");
                }
                // --- End Debugging ---
                // --- Debugging: Pose Landmark Verification ---
                if (this.debugMode) {
                    console.log(`--- Pose Landmark Verification ---`);
                    console.log(`Total poseLandmarks detected: ${poseLandmarks.length}`);
                    if (poseLandmarks.length !== 33) {
                        console.warn(`WARNING: Expected 33 landmarks, but got ${poseLandmarks.length}.`);
                    }
                    console.log('Presence of all detected landmarks (expand to see all 33):');
                    // Log all landmarks and their presence
                    poseLandmarks.forEach((lm, index) => {
                        const landmarkName = Object.keys(this.POSE || {}).find(key => this.POSE[key] === index) || `Landmark ${index}`;
                        console.log(`    ${landmarkName} (idx:${index}): present = ${!!lm}`); // !!lm checks for truthiness (presence)
                    });
                    console.log(`--- End Pose Landmark Verification ---`);
                }
                // --- End Debugging ---

                // --- NEW: Calculate Robot Height (Hip to Toe for one condition) ---
                let currentHipToToeHeight = 0;
                const leftHip = poseLandmarks[this.POSE.LEFT_HIP];
                const leftFoot = poseLandmarks[this.POSE.LEFT_FOOT_INDEX];
                const rightHip = poseLandmarks[this.POSE.RIGHT_HIP];
                const rightFoot = poseLandmarks[this.POSE.RIGHT_FOOT_INDEX];

                // Use the maximum height calculated from either left or right side, if available
                // Math.abs is used because Y-coordinates increase downwards in normalized coordinates.
                if (leftHip && leftFoot) {
                    currentHipToToeHeight = Math.max(currentHipToToeHeight, Math.abs(leftFoot.y - leftHip.y));
                }
                if (rightHip && rightFoot) {
                    currentHipToToeHeight = Math.max(currentHipToToeHeight, Math.abs(rightFoot.y - rightHip.y));
                }
                if (this.debugMode) console.log(`Calculated Robot Hip-to-Toe Height (normalized): ${currentHipToToeHeight.toFixed(3)}`);
                // --- End Robot Hip-to-Toe Height Calculation ---

                // --- NEW: Calculate Head to Toe Height (for the main presence check) ---
                let headToToeHeight = 0;
                const nose = poseLandmarks[this.POSE.NOSE]; // Using Nose as the head landmark

                // Ensure nose and at least one foot index are present for calculation
                if (nose) {
                    if (leftFoot) {
                        headToToeHeight = Math.max(headToToeHeight, Math.abs(leftFoot.y - nose.y));
                    }
                    if (rightFoot) {
                        headToToeHeight = Math.max(headToToeHeight, Math.abs(rightFoot.y - nose.y));
                    }
                }
                if (this.debugMode) console.log(`Calculated Robot Head-to-Toe Height (normalized): ${headToToeHeight.toFixed(3)}`);
                // --- End Head to Toe Height Calculation ---

                // --- NEW: Calculate Head to Hip Height for upper body detection ---
                let headToHipHeight = 0;
                const leftShoulder = poseLandmarks[this.POSE.LEFT_SHOULDER];
                const rightShoulder = poseLandmarks[this.POSE.RIGHT_SHOULDER];

                if (nose && leftHip && leftShoulder) {
                    // Average shoulder y for a more stable upper body top point
                    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
                    // Using the lower of the two hips for a more accurate bottom point
                    const lowerHipY = Math.max(leftHip.y, rightHip.y);
                    headToHipHeight = Math.abs(lowerHipY - avgShoulderY);
                } else if (nose && rightHip && rightShoulder) {
                    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
                    const lowerHipY = Math.max(leftHip.y, rightHip.y);
                    headToHipHeight = Math.abs(lowerHipY - avgShoulderY);
                }
                if (this.debugMode) console.log(`Calculated Robot Head-to-Hip Height (normalized): ${headToHipHeight.toFixed(3)}`);
                // --- End Head to Hip Height Calculation ---

           
                  // --- NEW: Calculate Head Height for head detection ---
                let headHeight = 0;
                const leftEye = poseLandmarks[this.POSE.LEFT_EYE];
                const rightEye = poseLandmarks[this.POSE.RIGHT_EYE];
                const mouthLeft = poseLandmarks[this.POSE.MOUTH_LEFT];
                const mouthRight = poseLandmarks[this.POSE.MOUTH_RIGHT];

                if (nose && leftEye && rightEye && mouthLeft && mouthRight) {
                    const avgEyeY = (leftEye.y + rightEye.y) / 2;
                    const avgMouthY = (mouthLeft.y + mouthRight.y) / 2;
                    headHeight = Math.abs(avgMouthY - avgEyeY); // Distance from average eye to average mouth
                } else if (nose && mouthLeft && mouthRight) {
                    // Fallback if eyes aren't detected but nose and mouth are
                    const avgMouthY = (mouthLeft.y + mouthRight.y) / 2;
                    headHeight = Math.abs(avgMouthY - nose.y);
                }
                if (this.debugMode) console.log(`Calculated Robot Head Height (normalized): ${headHeight.toFixed(3)}`);
                // --- End Head Height Calculation ---
           

                // NEW: Check if the full human body is visible using the new height-based logic
                // The '0.4' is an example threshold for normalized hip-to-toe height.
                // The '0.8' is an example threshold for normalized head-to-toe height.
                // Adjust these values as needed based on your camera setup and how much of the body needs to be visible.
                if (this.isFullBodyVisible(poseLandmarks, currentHipToToeHeight, headToToeHeight, 0.429, 0.844)) {
                    if (this.debugMode) console.log('Full body IS visible (heights sufficient). Mapping to robot.');
                    this.mapLandmarksToRobot(poseLandmarks);
                    this.drawLandmarks(poseLandmarks);
                } else if (this.isUpperBodyVisible(poseLandmarks, headToHipHeight, 0.502)) { // New upper body check with a threshold (e.g., 0.3)
                    if (this.debugMode) console.log('Upper body IS visible (height sufficient). Mapping upper body to robot.');
                    this.mapLandmarksToRobot(poseLandmarks); // Call new upper body mapping function
                    this.drawLandmarks(poseLandmarks);
                }
                else if (this.isHeadVisible(poseLandmarks, headHeight, 0.191)) { // New head check with a threshold (e.g., 0.1)
                    if (this.debugMode) console.log('Head IS visible (height sufficient). Mapping head to robot.');
                    this.mapHeadLandmarksToRobot(poseLandmarks); // Call new head mapping function
                    this.drawLandmarks(poseLandmarks);
                }
                else {
                    if (this.debugMode) console.log('Full body or upper body IS NOT visible (heights insufficient). Resetting robot.');
                    this.resetRobotToInitialPose();
                    this.drawLandmarks(poseLandmarks);
                }
            } else {
                // No landmarks detected at all
                if (this.debugMode) console.log('No pose landmarks detected. Resetting to initial pose.');
                this.resetRobotToInitialPose();
                this.drawLandmarks([]); // Clear overlay if no pose
            }
        } catch (error) {
            console.error("Pose detection error:", error);
            // In case of error, revert to initial pose as a safe fallback
            this.resetRobotToInitialPose();
            this.drawLandmarks([]);
        }
    } else if (!this.videoInitialized && this.video.readyState >= 2) { // Check if video is ready to play
        this.overlayCanvas = document.getElementById("overlay");
        this.overlayCanvas.width = this.video.videoWidth;
        this.overlayCanvas.height = this.video.videoHeight;
        this.overlayCtx = this.overlayCanvas.getContext("2d");
        this.videoInitialized = true; // Mark as initialized
        if (this.debugMode) console.log("Video element dimensions updated for overlay.");
    } else {
        // No new video frame or video not ready, but we still want to keep the loop going
        if (this.debugMode) console.log("No new video frame or video not ready.");
        if (this.video.paused) {
            this.drawLandmarks([]); // Clear overlay if paused
        }
    }
    this.animationFrameId = requestAnimationFrame(this.detectPosesInRealTime.bind(this));
}


// Add this new function to your class, similar to isUpperBodyVisible
isHeadVisible(landmarks, headHeight, minHeadThreshold = 0.191) { // Renamed parameters for clarity
    let isHeadHeightSufficient = true; // This flag represents if the head height is sufficient

    // Check if headHeight is NOT greater than the fixed threshold, then it's not sufficient
    if (headHeight > minHeadThreshold) {
        isHeadHeightSufficient = false;
        if (this.debugMode) console.log(`Head Height (${headHeight.toFixed(3)}) not sufficient (required: > ${minHeadThreshold.toFixed(3)}).`);
    } else {
        if (this.debugMode) console.log(`Head Height (${headHeight.toFixed(3)}) is sufficient (required: > ${minHeadThreshold.toFixed(3)}).`);
    }

    // Ensure core head landmarks are present for robustness
    const nose = landmarks[this.POSE.NOSE];
    const leftEye = landmarks[this.POSE.LEFT_EYE];
    const rightEye = landmarks[this.POSE.RIGHT_EYE];
    const leftEar = landmarks[this.POSE.LEFT_EAR];
    const rightEar = landmarks[this.POSE.RIGHT_EAR];
    const mouthLeft = landmarks[this.POSE.MOUTH_LEFT];
    const mouthRight = landmarks[this.POSE.MOUTH_RIGHT];

    const essentialHeadLandmarksPresent =
        nose &&
        leftEye && rightEye &&
        leftEar && rightEar &&
        mouthLeft && mouthRight;

    if (this.debugMode) {
        console.log(`Essential head landmarks present: ${essentialHeadLandmarksPresent}`);
    }

    // Return true only if both the height condition and essential landmark presence are met
    return isHeadHeightSufficient && essentialHeadLandmarksPresent;
}

isUpperBodyVisible(landmarks, headToHipHeight, minHeadToHipThreshold = 0.502) { // Renamed parameters for clarity
    let isUpperBodyHeightSufficient = true; // This flag represents if the head-to-hip height is sufficient

    // Check if headToHipHeight is NOT greater than the fixed threshold, then it's not sufficient
    if (headToHipHeight > minHeadToHipThreshold) {
        isUpperBodyHeightSufficient = false;
        if (this.debugMode) console.log(`Upper Body Height (${headToHipHeight.toFixed(3)}) not sufficient (required: > ${minHeadToHipThreshold.toFixed(3)}).`);
    } else {
        if (this.debugMode) console.log(`Upper Body Height (${headToHipHeight.toFixed(3)}) is sufficient (required: > ${minHeadToHipThreshold.toFixed(3)}).`);
    }

    // Additionally, you might want to ensure at least some core upper body landmarks are detected,
    // even if the height check is the primary determinant. This prevents false positives
    // if the height calculation is erratic but no actual pose is present.
    // However, if the height calculation itself is robust enough to imply landmark presence,
    // you can rely solely on the height. For a robust solution, checking a few key points is good.
    const nose = landmarks[this.POSE.NOSE];
    const leftShoulder = landmarks[this.POSE.LEFT_SHOULDER];
    const rightShoulder = landmarks[this.POSE.RIGHT_SHOULDER];
    const leftElbow = landmarks[this.POSE.LEFT_ELBOW];
    const rightElbow = landmarks[this.POSE.RIGHT_ELBOW];
    const leftWrist = landmarks[this.POSE.LEFT_WRIST];
    const rightWrist = landmarks[this.POSE.RIGHT_WRIST];
    const leftHip = landmarks[this.POSE.LEFT_HIP];
    const rightHip = landmarks[this.POSE.RIGHT_HIP];


    // You can adjust which "key" upper body landmarks are essential for detection.
    // For a minimal check: nose, shoulders, and hips.
    // For a more comprehensive check: include elbows and wrists.
    const essentialUpperBodyLandmarksPresent =
        nose &&
        leftShoulder && rightShoulder &&
        leftHip && rightHip &&
        leftElbow && rightElbow &&
        leftWrist && rightWrist; // Added elbows and wrists for a more robust upper body check

    if (this.debugMode) {
        console.log(`Essential upper body landmarks present: ${essentialUpperBodyLandmarksPresent}`);
    }


    // Return true only if both the height condition and essential landmark presence are met
    return isUpperBodyHeightSufficient && essentialUpperBodyLandmarksPresent;
}

    /**
     * Checks if the overall body height (head to toe) is sufficient AND the hip-to-toe height is sufficient.
     * This version replaces the individual key landmark presence check with a head-to-toe height check.
     * It does NOT consider the 'visibility' property from MediaPipe.
     * @param {Array} landmarks - The array of pose landmarks from MediaPipe (not directly used for individual presence check here).
     * @param {number} actualHipToToeHeight - The calculated hip-to-toe height of the detected pose (normalized).
     * @param {number} headToToeHeight - The calculated head-to-toe height of the detected pose (normalized).
     * @param {number} minHipToToeThreshold - The minimum normalized hip-to-toe height required.
     * @param {number} minHeadToToeThreshold - The minimum normalized head-to-toe height required for "all key landmarks present" condition.
     * @returns {boolean} True if both height conditions are met, false otherwise.
     */
    isFullBodyVisible(landmarks, actualHipToToeHeight, headToToeHeight, minHipToToeThreshold = 0.429, minHeadToToeThreshold = 0.844) {
        let allKeyLandmarksConsideredPresent = true; // This flag now represents if the head-to-toe height is sufficient

        // Replaced the loop checking for individual landmark presence with this head-to-toe height check.
        // If headToToeHeight is NOT greater than the fixed difference, then allKeyLandmarksConsideredPresent becomes false.
        if (headToToeHeight > minHeadToToeThreshold) { 
            allKeyLandmarksConsideredPresent = false;
            if (this.debugMode) console.log(`Head-to-Toe Height (${headToToeHeight.toFixed(2)}) not sufficient (required: > ${minHeadToToeThreshold.toFixed(2)}).`);
        } else {
            if (this.debugMode) console.log(`Head-to-Toe Height (${headToToeHeight.toFixed(2)}) is sufficient (required: > ${minHeadToToeThreshold.toFixed(2)}).`);
        }

        // The keyLandmarkIndices array from the original code is still defined for context, 
        // but the loop that iterated through it to set `allVisible` (now `allKeyLandmarksConsideredPresent`)
        // has been removed as per your instruction to replace it with the height check.
        // The `POSE` constant here should be `this.POSE` if it's a class member, for consistency.
        // Removed `const POSE = { ... }` local definition and related `keyLandmarkIndices` loop
        // to fully reflect the replacement of that logic.

        // Second check: Is the hip-to-toe height sufficient?
        const isHipToToeHeightSufficient = actualHipToToeHeight < minHipToToeThreshold;
        if (this.debugMode) {
            console.log(`Hip-to-Toe Height Check: ${actualHipToToeHeight.toFixed(2)} > ${minHipToToeThreshold.toFixed(2)} = ${isHipToToeHeightSufficient}`);
        }

        // Return true only if both height conditions are met
        return allKeyLandmarksConsideredPresent && isHipToToeHeightSufficient;
    }

    /**
     * Resets all controlled robot joints to their predefined initial/default values.
     * Also resets the smoothing history for these joints to ensure a clean start.
     */
    resetRobotToInitialPose() {
        for (const jointName in this.initialRobotPose) {
            this.viewer?.updateJoint(jointName, this.initialRobotPose[jointName]);
            // Also reset the smoothed value for consistency to prevent jumpiness on re-entry
            this.previousJointValues[jointName] = this.initialRobotPose[jointName];
        }
    }
drawLandmarks(landmarks) {

        if (!this.overlayCtx || !this.overlayCanvas) {

            if (this.debugMode) console.warn("Overlay canvas not initialized for drawing.");

            return;

        }

        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);



        if (landmarks.length === 0) { // If no landmarks, just clear and return

            return;

        }



        // Save the current state of the canvas

        this.overlayCtx.save();

       

        // Flip the canvas horizontally to un-mirror the drawing

        this.overlayCtx.translate(this.overlayCanvas.width, 0);

        this.overlayCtx.scale(-1, 1);



        const scaleX = this.overlayCanvas.width;

        const scaleY = this.overlayCanvas.height;



        // Define connections for all relevant body parts

        const connections = [

            // Head

            [0, 1], [0, 4], [1, 2], [2, 3], [4, 5], [5, 6], [9, 10], // Face landmarks

            [0, 7], [0, 8], // Nose to ears (simplified for visual)



            // Torso

            [11, 12], // Shoulders

            [23, 24], // Hips

            [11, 23], [12, 24], // Shoulders to Hips (torso sides)

            [11, 13], [13, 15], // Left Arm

            [12, 14], [14, 16], // Right Arm



            // Legs

            [23, 25], [25, 27], // Left Leg: Hip to Knee to Ankle

            [24, 26], [26, 28], // Right Leg: Hip to Knee to Ankle

            [27, 29], [29, 31], // Left Foot: Ankle to Heel to Foot Index

            [28, 30], [30, 32]  // Right Foot: Ankle to Heel to Foot Index

        ];



        this.overlayCtx.strokeStyle = '#33aaff'; // A vibrant blue for lines

        this.overlayCtx.lineWidth = 5; // Increased line width for connections

        for (const connection of connections) {

            const start = landmarks[connection[0]];

            const end = landmarks[connection[1]];

           

            // Only draw connection if both landmarks are valid and sufficiently visible

            if (start && end &&

                (start.visibility === undefined || start.visibility > 0.5) &&

                (end.visibility === undefined || end.visibility > 0.5)) {

                this.overlayCtx.beginPath();

                this.overlayCtx.moveTo(start.x * scaleX, start.y * scaleY);

                this.overlayCtx.lineTo(end.x * scaleX, end.y * scaleY);

                this.overlayCtx.stroke();

            }

        }



        // Draw individual landmarks (points)

        this.overlayCtx.fillStyle = '#FF4136'; // Red for landmarks

        this.overlayCtx.strokeStyle = '#FFFFFF'; // White border

        this.overlayCtx.lineWidth = 2; // Increased line width for landmark borders

        for (let i = 0; i < landmarks.length; i++) {

            // Only draw if landmark exists and visibility is good

            if (landmarks[i] && (landmarks[i].visibility === undefined || landmarks[i].visibility > 0.5)) {

                const x = landmarks[i].x * scaleX;

                const y = landmarks[i].y * scaleY;

               

                this.overlayCtx.beginPath();

                this.overlayCtx.arc(x, y, 7, 0, 2 * Math.PI); // Increased radius for landmarks

                this.overlayCtx.fill();

                this.overlayCtx.stroke(); // Draw border

            }

        }



        // Restore the canvas state

        this.overlayCtx.restore();

}
mapHeadLandmarksToRobot(poseLandmarks){
     const POSE = {
        NOSE: 0,
        LEFT_EYE_INNER: 1,
        LEFT_EYE: 2,
        LEFT_EYE_OUTER: 3,
        RIGHT_EYE_INNER: 4,
        RIGHT_EYE: 5,
        RIGHT_EYE_OUTER: 6,
        LEFT_EAR: 7,
        RIGHT_EAR: 8,
        LEFT_SHOULDER: 11,
        LEFT_ELBOW: 13,
        LEFT_WRIST: 15,
        RIGHT_SHOULDER: 12,
        RIGHT_ELBOW: 14,
        RIGHT_WRIST: 16,
        LEFT_HIP: 23,
        RIGHT_HIP: 24,
        LEFT_KNEE: 25,
        RIGHT_KNEE: 26,
        LEFT_ANKLE: 27,
        RIGHT_ANKLE: 28,
        LEFT_FOOT_INDEX: 31,
        RIGHT_FOOT_INDEX: 32

    };

    // Helper functions for 2D/3D operations
    const create2DVector = (p1, p2) => ({
        x: p2.x - p1.x,
        y: p2.y - p1.y
    });

    // New helper for 3D vector - KEPT because it's part of your provided helpers
    const create3DVector = (p1, p2) => ({
        x: p2.x - p1.x,
        y: p2.y - p1.y,
        z: p2.z - p1.z
    });

    const angle2D = (vec) => Math.atan2(vec.y, vec.x);

    const angleBetweenVectors = (vec1, vec2) => {
        const dotProduct = vec1.x * vec2.x + vec1.y * vec2.y;
        const magnitude1 = vectorMagnitude(vec1);
        const magnitude2 = vectorMagnitude(vec2);
        if (magnitude1 === 0 || magnitude2 === 0) return 0;
        const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct / (magnitude1 * magnitude2)));
        return Math.acos(clampedDotProduct);
    };

    const vectorMagnitude = (vec) => Math.hypot(vec.x, vec.y);
    const vectorMagnitude3D = (vec) => Math.hypot(vec.x, vec.y, vec.z); // New: 3D magnitude - KEPT

    // Smoothing
    if (!this.previousJointValues) this.previousJointValues = {};
    const smooth = (jointName, value, alpha = 0.2) => {
        if (isNaN(value)) {
            if (this.debugMode) console.warn(`Smoothing: Input value for ${jointName} is NaN. Using previous or default.`);
            return this.previousJointValues[jointName] || (this.initialRobotPose[jointName] || 0);
        }
        const prev = this.previousJointValues[jointName] ?? value;
        const smoothed = prev * (1 - alpha) + value * alpha;
        this.previousJointValues[jointName] = smoothed;
        return smoothed;
    };

    // Landmark validation
    const isValid = (landmark) => landmark &&
        (landmark.visibility === undefined || landmark.visibility > 0.5);


    // --- Head Logic ---
// We now also need LEFT_SHOULDER and RIGHT_SHOULDER for distance calculation
if (isValid(poseLandmarks[POSE.NOSE]) &&
    isValid(poseLandmarks[POSE.LEFT_EYE_OUTER]) &&
    isValid(poseLandmarks[POSE.RIGHT_EYE_OUTER]) &&
    isValid(poseLandmarks[POSE.LEFT_EAR]) &&
    isValid(poseLandmarks[POSE.RIGHT_EAR]) &&
    isValid(poseLandmarks[POSE.LEFT_SHOULDER]) && // <-- New validation for shoulders
    isValid(poseLandmarks[POSE.RIGHT_SHOULDER])) { // <-- New validation for shoulders

    const nose = poseLandmarks[POSE.NOSE];
    const leftEye = poseLandmarks[POSE.LEFT_EYE_OUTER]; // Still used for yaw/pitch calculation
    const rightEye = poseLandmarks[POSE.RIGHT_EYE_OUTER]; // Still used for yaw/pitch calculation

    const leftShoulder = poseLandmarks[POSE.LEFT_SHOULDER];   // <-- New: Get shoulder landmarks
    const rightShoulder = poseLandmarks[POSE.RIGHT_SHOULDER]; // <-- New: Get shoulder landmarks

    if (this.debugMode) {
        console.groupCollapsed('Head Debug (Raw Landmarks)');
        console.log(`Nose (0): x:${nose.x.toFixed(4)}, y:${nose.y.toFixed(4)}, z:${nose.z ? nose.z.toFixed(4) : 'N/A'}, vis:${nose.visibility ? nose.visibility.toFixed(4) : 'N/A'}`);
        console.log(`L_Eye_Outer (3): x:${leftEye.x.toFixed(4)}, y:${leftEye.y.toFixed(4)}, z:${leftEye.z ? leftEye.z.toFixed(4) : 'N/A'}, vis:${leftEye.visibility ? leftEye.visibility.toFixed(4) : 'N/A'}`);
        console.log(`R_Eye_Outer (6): x:${rightEye.x.toFixed(4)}, y:${rightEye.y.toFixed(4)}, z:${rightEye.z ? rightEye.z.toFixed(4) : 'N/A'}, vis:${rightEye.visibility ? rightEye.visibility.toFixed(4) : 'N/A'}`);
        // <-- ADDED DEBUGGING FOR SHOULDERS -->
        console.log(`L_Shoulder (11): x:${leftShoulder.x.toFixed(4)}, y:${leftShoulder.y.toFixed(4)}, z:${leftShoulder.z ? leftShoulder.z.toFixed(4) : 'N/A'}, vis:${leftShoulder.visibility ? leftShoulder.visibility.toFixed(4) : 'N/A'}`);
        console.log(`R_Shoulder (12): x:${rightShoulder.x.toFixed(4)}, y:${rightShoulder.y.toFixed(4)}, z:${rightShoulder.z ? rightShoulder.z.toFixed(4) : 'N/A'}, vis:${rightShoulder.visibility ? rightShoulder.visibility.toFixed(4) : 'N/A'}`);
        console.groupEnd();
    }

    // --- UPDATED: Calculate proxy for 'distance from camera' using shoulders ---
    const shoulderDistancePixels = Math.abs(rightShoulder.x - leftShoulder.x); // <-- Change to shoulder distance

    // --- IMPORTANT: CALIBRATE THIS NEW VALUE ---
    // You will need to determine this value empirically by observing
    // 'shoulderDistance' in the console when the user is at an ideal distance.
    const REFERENCE_SHOULDER_DISTANCE = 0.25; // <--- !!! ADJUST THIS VALUE BASED ON YOUR CALIBRATION !!!
                                            // This will likely be different from your eye-distance reference.

    let distanceFactor = REFERENCE_SHOULDER_DISTANCE / shoulderDistancePixels; // <-- Use shoulder distance
    distanceFactor = Math.max(0.5, Math.min(2.5, distanceFactor)); // Keep clamping

    // --- Calculate head_z (Yaw - left/right rotation) ---
    const eyeMidpointX = (leftEye.x + rightEye.x) / 2;
    const yawMovement = nose.x - eyeMidpointX;
    const baseYawSensitivity = 45;
    let head_z_val = yawMovement * (baseYawSensitivity * distanceFactor);

    // Clamp to URDF limits
    head_z_val = Math.max(-1.57079632679, Math.min(1.57079632679, head_z_val));
    head_z_val = smooth('head_z', head_z_val);
    this.viewer?.updateJoint('head_z', head_z_val);

    // --- Calculate head_y (Pitch - up/down rotation) ---
    const eyeMidpointY = (leftEye.y + rightEye.y) / 2;
    const pitchMovement = nose.y - eyeMidpointY;
    const basePitchSensitivity = 15;
    let head_y_val = -pitchMovement * (basePitchSensitivity * distanceFactor);

    // Clamp to URDF limits
    head_y_val = Math.max(-0.785398163397, Math.min(0.10471975512, head_y_val));
    head_y_val = smooth('head_y', head_y_val);
    this.viewer?.updateJoint('head_y', head_y_val);


    if (this.debugMode) {
        console.log('2D Mapping Head Results (Smoothed):', {
            head_z: head_z_val.toFixed(3),
            head_y: head_y_val.toFixed(3),
            shoulderDistance: shoulderDistancePixels.toFixed(4), // <-- CHANGED TO SHOULDER DISTANCE
            distanceFactor: distanceFactor.toFixed(2)
        });
    }

} else {
    if (this.debugMode) console.warn("Invalid head or shoulder landmarks, defaulting head joints to initial pose."); // <-- Updated warning
    this.viewer?.updateJoint('head_z', this.initialRobotPose.head_z);
    this.viewer?.updateJoint('head_y', this.initialRobotPose.head_y);
}

}


mapLandmarksToRobot(poseLandmarks) {
    const POSE = {
        NOSE: 0,
        LEFT_EYE_INNER: 1,
        LEFT_EYE: 2,
        LEFT_EYE_OUTER: 3,
        RIGHT_EYE_INNER: 4,
        RIGHT_EYE: 5,
        RIGHT_EYE_OUTER: 6,
        LEFT_EAR: 7,
        RIGHT_EAR: 8,
        LEFT_SHOULDER: 11,
        LEFT_ELBOW: 13,
        LEFT_WRIST: 15,
        RIGHT_SHOULDER: 12,
        RIGHT_ELBOW: 14,
        RIGHT_WRIST: 16,
        LEFT_HIP: 23,
        RIGHT_HIP: 24,
        LEFT_KNEE: 25,
        RIGHT_KNEE: 26,
        LEFT_ANKLE: 27,
        RIGHT_ANKLE: 28,
        LEFT_FOOT_INDEX: 31,
        RIGHT_FOOT_INDEX: 32

    };

    // Helper functions for 2D/3D operations
    const create2DVector = (p1, p2) => ({
        x: p2.x - p1.x,
        y: p2.y - p1.y
    });

    // New helper for 3D vector - KEPT because it's part of your provided helpers
    const create3DVector = (p1, p2) => ({
        x: p2.x - p1.x,
        y: p2.y - p1.y,
        z: p2.z - p1.z
    });

    const angle2D = (vec) => Math.atan2(vec.y, vec.x);

    const angleBetweenVectors = (vec1, vec2) => {
        const dotProduct = vec1.x * vec2.x + vec1.y * vec2.y;
        const magnitude1 = vectorMagnitude(vec1);
        const magnitude2 = vectorMagnitude(vec2);
        if (magnitude1 === 0 || magnitude2 === 0) return 0;
        const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct / (magnitude1 * magnitude2)));
        return Math.acos(clampedDotProduct);
    };

    const vectorMagnitude = (vec) => Math.hypot(vec.x, vec.y);
    const vectorMagnitude3D = (vec) => Math.hypot(vec.x, vec.y, vec.z); // New: 3D magnitude - KEPT

    // Smoothing
    if (!this.previousJointValues) this.previousJointValues = {};
    const smooth = (jointName, value, alpha = 0.2) => {
        if (isNaN(value)) {
            if (this.debugMode) console.warn(`Smoothing: Input value for ${jointName} is NaN. Using previous or default.`);
            return this.previousJointValues[jointName] || (this.initialRobotPose[jointName] || 0);
        }
        const prev = this.previousJointValues[jointName] ?? value;
        const smoothed = prev * (1 - alpha) + value * alpha;
        this.previousJointValues[jointName] = smoothed;
        return smoothed;
    };

    // Landmark validation
    const isValid = (landmark) => landmark &&
        (landmark.visibility === undefined || landmark.visibility > 0.5);

    // --- ABS (Torso) Logic ---
    const MID_SHOULDER_X = (poseLandmarks[POSE.LEFT_SHOULDER]?.x + poseLandmarks[POSE.RIGHT_SHOULDER]?.x) / 2;
    const MID_SHOULDER_Y = (poseLandmarks[POSE.LEFT_SHOULDER]?.y + poseLandmarks[POSE.RIGHT_SHOULDER]?.y) / 2;
    const MID_HIP_X = (poseLandmarks[POSE.LEFT_HIP]?.x + poseLandmarks[POSE.RIGHT_HIP]?.x) / 2;
    const MID_HIP_Y = (poseLandmarks[POSE.LEFT_HIP]?.y + poseLandmarks[POSE.RIGHT_HIP]?.y) / 2;

    // --- Calculate Mid-Shoulder Z and Mid-Hip Z ---
    const MID_SHOULDER_Z = (poseLandmarks[POSE.LEFT_SHOULDER]?.z + poseLandmarks[POSE.RIGHT_SHOULDER]?.z) / 2;
    const MID_HIP_Z = (poseLandmarks[POSE.LEFT_HIP]?.z + poseLandmarks[POSE.RIGHT_HIP]?.z) / 2;

    // Removed the 'torsoCenterX', 'torsoCenterY', 'torsoCenterZ' calculation and smoothing.
    // This also removes the associated console logs for torso center.

    let areTorsoLandmarksValid = isValid(poseLandmarks[POSE.LEFT_SHOULDER]) &&
                                 isValid(poseLandmarks[POSE.RIGHT_SHOULDER]) &&
                                 isValid(poseLandmarks[POSE.LEFT_HIP]) &&
                                 isValid(poseLandmarks[POSE.RIGHT_HIP]);

    if (this.debugMode && !areTorsoLandmarksValid) {
        console.warn("Not all torso landmarks visible for ABS calculations.");
    }

    // --- ABS (Torso) Logic ---
    if (areTorsoLandmarksValid) {
        if (this.debugMode) {
            console.groupCollapsed('ABS Debug (Raw Landmarks)');
            console.log(`L_Shoulder (11): x:${poseLandmarks[POSE.LEFT_SHOULDER].x.toFixed(4)}, y:${poseLandmarks[POSE.LEFT_SHOULDER].y.toFixed(4)}, z:${poseLandmarks[POSE.LEFT_SHOULDER].z.toFixed(4)}`);
            console.log(`R_Shoulder (12): x:${poseLandmarks[POSE.RIGHT_SHOULDER].x.toFixed(4)}, y:${poseLandmarks[POSE.RIGHT_SHOULDER].y.toFixed(4)}, z:${poseLandmarks[POSE.RIGHT_SHOULDER].z.toFixed(4)}`);
            console.log(`L_Hip (23): x:${poseLandmarks[POSE.LEFT_HIP].x.toFixed(4)}, y:${poseLandmarks[POSE.LEFT_HIP].y.toFixed(4)}, z:${poseLandmarks[POSE.LEFT_HIP].z.toFixed(4)}`);
            console.log(`R_Hip (24): x:${poseLandmarks[POSE.RIGHT_HIP].x.toFixed(4)}, y:${poseLandmarks[POSE.RIGHT_HIP].y.toFixed(4)}, z:${poseLandmarks[POSE.RIGHT_HIP].z.toFixed(4)}`);
            console.groupEnd();
        }

        // --- abs_x: Side Bend (Lean Left/Right) ---
        const shoulderVerticalDifference = poseLandmarks[POSE.LEFT_SHOULDER].y - poseLandmarks[POSE.RIGHT_SHOULDER].y;
        const shoulderHorizontalDistance = Math.abs(poseLandmarks[POSE.RIGHT_SHOULDER].x - poseLandmarks[POSE.LEFT_SHOULDER].x);

      let absX = 0;
const sideBendThreshold = 0.01; // E.g., ignore differences smaller than 1% of screen height/width
if (Math.abs(shoulderVerticalDifference) > sideBendThreshold && shoulderHorizontalDistance > 0.01) {
    const sideBendSensitivity = 1.0; // Adjusted sensitivity
    absX = (shoulderVerticalDifference / shoulderHorizontalDistance) * sideBendSensitivity * -1;
}

        absX = smooth('abs_x', absX);
        absX = Math.max(-0.79, Math.min(0.79, absX));
        this.viewer?.updateJoint('abs_x', absX);

        // --- abs_y: Forward/Backward Lean ---
        const torsoVec = create2DVector({
            x: MID_HIP_X,
            y: MID_HIP_Y
        }, {
            x: MID_SHOULDER_X,
            y: MID_SHOULDER_Y
        });
        const torsoAngle = angle2D(torsoVec);

        const mappedAngle = torsoAngle + Math.PI / 2;

        let absY = 0;
        const robotAbsYMin = -0.87;
        const robotAbsYMax = 0.21;
        const robotAbsYStraight = 0;

        const humanStraightMappedAngle = 0.02;
        const humanLeanRange = 0.6;
        const humanLeanBackwardAngle = humanStraightMappedAngle - (humanLeanRange / 2);
        const humanLeanForwardAngle = humanStraightMappedAngle + (humanLeanRange / 2);

        if (mappedAngle < humanLeanBackwardAngle) {
            absY = robotAbsYMin;
        } else if (mappedAngle > humanLeanForwardAngle) {
            absY = robotAbsYMax;
        } else {
            if (mappedAngle <= humanStraightMappedAngle) {
                const rangeInput = humanStraightMappedAngle - humanLeanBackwardAngle;
                const rangeOutput = robotAbsYStraight - robotAbsYMin;
                if (rangeInput > 0) {
                    absY = robotAbsYMin + rangeOutput *
                        ((mappedAngle - humanLeanBackwardAngle) / rangeInput);
                } else {
                    absY = robotAbsYStraight;
                }
            } else {
                const rangeInput = humanLeanForwardAngle - humanStraightMappedAngle;
                const rangeOutput = robotAbsYMax - robotAbsYStraight;
                if (rangeInput > 0) {
                    absY = robotAbsYStraight + rangeOutput *
                        ((mappedAngle - humanStraightMappedAngle) / rangeInput);
                } else {
                    absY = robotAbsYStraight;
                }
            }
        }

        absY = smooth('abs_y', absY);
        absY = Math.max(robotAbsYMin, Math.min(robotAbsYMax, absY));
        this.viewer?.updateJoint('abs_y', absY);

        // --- abs_z: Torso Twist (Yaw) ---
        const shoulderZDifference = poseLandmarks[POSE.LEFT_SHOULDER].z - poseLandmarks[POSE.RIGHT_SHOULDER].z;

       
let absZ = 0;
 const twistNeutralZDiff = 0.0;
const twistThreshold = 0.02; // E.g., ignore Z differences smaller than 2% of total depth
if (Math.abs(shoulderZDifference - twistNeutralZDiff) > twistThreshold) {
    const twistSensitivity = 1.5; // Adjusted sensitivity
    absZ = (shoulderZDifference - twistNeutralZDiff) * twistSensitivity;
}


        absZ = smooth('abs_z', absZ);
        absZ = Math.max(-1.57, Math.min(1.57, absZ));
        this.viewer?.updateJoint('abs_z', absZ);

        if (this.debugMode) {
            console.log('3D Mapping ABS Results (with Z for Twist):', {
                absX: absX.toFixed(3) + ' (Side Bend - Left is +)',
                absY: absY.toFixed(3) + ' (Fwd/Bwd Lean - Fwd is +)',
                absZ: absZ.toFixed(3) + ' (Twist - Left is +)',
                shoulderVerticalDifference: shoulderVerticalDifference.toFixed(3),
                torsoAngle: (torsoAngle * 180 / Math.PI).toFixed(1) + '° (Raw Y-lean)',
                mappedTorsoAngle: (mappedAngle * 180 / Math.PI).toFixed(1) + '° (Relative Y-lean)',
                shoulderZDifference: shoulderZDifference.toFixed(4) + ' (L_Shoulder.z - R_Shoulder.z)',
            });
        }
    } else {
        if (this.debugMode) console.warn("Invalid torso landmarks, defaulting abs joints to initial pose.");
        this.viewer?.updateJoint('abs_x', this.initialRobotPose.abs_x);
        this.viewer?.updateJoint('abs_y', this.initialRobotPose.abs_y);
        this.viewer?.updateJoint('abs_z', this.initialRobotPose.abs_z);
    }

  // ... (your existing POSE definitions and helper functions)

// --- Head Logic ---
// We now also need LEFT_SHOULDER and RIGHT_SHOULDER for distance calculation
if (isValid(poseLandmarks[POSE.NOSE]) &&
    isValid(poseLandmarks[POSE.LEFT_EYE_OUTER]) &&
    isValid(poseLandmarks[POSE.RIGHT_EYE_OUTER]) &&
    isValid(poseLandmarks[POSE.LEFT_EAR]) &&
    isValid(poseLandmarks[POSE.RIGHT_EAR]) &&
    isValid(poseLandmarks[POSE.LEFT_SHOULDER]) && // <-- New validation for shoulders
    isValid(poseLandmarks[POSE.RIGHT_SHOULDER])) { // <-- New validation for shoulders

    const nose = poseLandmarks[POSE.NOSE];
    const leftEye = poseLandmarks[POSE.LEFT_EYE_OUTER]; // Still used for yaw/pitch calculation
    const rightEye = poseLandmarks[POSE.RIGHT_EYE_OUTER]; // Still used for yaw/pitch calculation

    const leftShoulder = poseLandmarks[POSE.LEFT_SHOULDER];   // <-- New: Get shoulder landmarks
    const rightShoulder = poseLandmarks[POSE.RIGHT_SHOULDER]; // <-- New: Get shoulder landmarks

    if (this.debugMode) {
        console.groupCollapsed('Head Debug (Raw Landmarks)');
        console.log(`Nose (0): x:${nose.x.toFixed(4)}, y:${nose.y.toFixed(4)}, z:${nose.z ? nose.z.toFixed(4) : 'N/A'}, vis:${nose.visibility ? nose.visibility.toFixed(4) : 'N/A'}`);
        console.log(`L_Eye_Outer (3): x:${leftEye.x.toFixed(4)}, y:${leftEye.y.toFixed(4)}, z:${leftEye.z ? leftEye.z.toFixed(4) : 'N/A'}, vis:${leftEye.visibility ? leftEye.visibility.toFixed(4) : 'N/A'}`);
        console.log(`R_Eye_Outer (6): x:${rightEye.x.toFixed(4)}, y:${rightEye.y.toFixed(4)}, z:${rightEye.z ? rightEye.z.toFixed(4) : 'N/A'}, vis:${rightEye.visibility ? rightEye.visibility.toFixed(4) : 'N/A'}`);
        // <-- ADDED DEBUGGING FOR SHOULDERS -->
        console.log(`L_Shoulder (11): x:${leftShoulder.x.toFixed(4)}, y:${leftShoulder.y.toFixed(4)}, z:${leftShoulder.z ? leftShoulder.z.toFixed(4) : 'N/A'}, vis:${leftShoulder.visibility ? leftShoulder.visibility.toFixed(4) : 'N/A'}`);
        console.log(`R_Shoulder (12): x:${rightShoulder.x.toFixed(4)}, y:${rightShoulder.y.toFixed(4)}, z:${rightShoulder.z ? rightShoulder.z.toFixed(4) : 'N/A'}, vis:${rightShoulder.visibility ? rightShoulder.visibility.toFixed(4) : 'N/A'}`);
        console.groupEnd();
    }

    // --- UPDATED: Calculate proxy for 'distance from camera' using shoulders ---
    const shoulderDistancePixels = Math.abs(rightShoulder.x - leftShoulder.x); // <-- Change to shoulder distance

    // --- IMPORTANT: CALIBRATE THIS NEW VALUE ---
    // You will need to determine this value empirically by observing
    // 'shoulderDistance' in the console when the user is at an ideal distance.
    const REFERENCE_SHOULDER_DISTANCE = 0.25; // <--- !!! ADJUST THIS VALUE BASED ON YOUR CALIBRATION !!!
                                            // This will likely be different from your eye-distance reference.

    let distanceFactor = REFERENCE_SHOULDER_DISTANCE / shoulderDistancePixels; // <-- Use shoulder distance
    distanceFactor = Math.max(0.5, Math.min(2.5, distanceFactor)); // Keep clamping

    // --- Calculate head_z (Yaw - left/right rotation) ---
    const eyeMidpointX = (leftEye.x + rightEye.x) / 2;
    const yawMovement = nose.x - eyeMidpointX;
    const baseYawSensitivity = 45;
    let head_z_val = yawMovement * (baseYawSensitivity * distanceFactor);

    // Clamp to URDF limits
    head_z_val = Math.max(-1.57079632679, Math.min(1.57079632679, head_z_val));
    head_z_val = smooth('head_z', head_z_val);
    this.viewer?.updateJoint('head_z', head_z_val);

    // --- Calculate head_y (Pitch - up/down rotation) ---
    const eyeMidpointY = (leftEye.y + rightEye.y) / 2;
    const pitchMovement = nose.y - eyeMidpointY;
    const basePitchSensitivity = 15;
    let head_y_val = -pitchMovement * (basePitchSensitivity * distanceFactor);

    // Clamp to URDF limits
    head_y_val = Math.max(-0.785398163397, Math.min(0.10471975512, head_y_val));
    head_y_val = smooth('head_y', head_y_val);
    this.viewer?.updateJoint('head_y', head_y_val);


    if (this.debugMode) {
        console.log('2D Mapping Head Results (Smoothed):', {
            head_z: head_z_val.toFixed(3),
            head_y: head_y_val.toFixed(3),
            shoulderDistance: shoulderDistancePixels.toFixed(4), // <-- CHANGED TO SHOULDER DISTANCE
            distanceFactor: distanceFactor.toFixed(2)
        });
    }

} else {
    if (this.debugMode) console.warn("Invalid head or shoulder landmarks, defaulting head joints to initial pose."); // <-- Updated warning
    this.viewer?.updateJoint('head_z', this.initialRobotPose.head_z);
    this.viewer?.updateJoint('head_y', this.initialRobotPose.head_y);
}
    /*

    // --- Example of how the torso center could influence robot position (if applicable) ---
    // This is highly dependent on your robot's capabilities and how you want to map human position.
    // For a simple example, let's say the robot's base can move left/right (along the camera's X axis)
    // or forward/backward (along the camera's Y axis, representing depth).
    // These would typically be 'base_x', 'base_y' (for vertical), and 'base_z' (for depth/forward-backward)


    // Let's assume a normalized camera frame (0 to 1 for x,y).
    // For Z, remember MediaPipe's normalized Z: smaller Z is closer to camera, 0 is at hip midpoint.

    // Define robot base movement limits (example values, adjust for your robot's range)
    const robotBaseXMin = -0.79; // Robot moves left
    const robotBaseXMax = 0.79;  // Robot moves right
    const robotBaseYMin = -0.87; // Robot moves "up" in robot space (if base_y is vertical)
    const robotBaseYMax = 0.21;  // Robot moves "down" in robot space (if base_y is vertical)
    const robotBaseZMin = -1.57; // Robot moves backward (further away)
    const robotBaseZMax = 1.57;  // Robot moves forward (closer)

    // Center of the camera view (normalized 0 to 1)
    const cameraCenterX = 0.5;
    const cameraCenterY = 0.5;

    // --- Depth Calibration for overall robot position ---
    const humanNeutralZ = 0.0; // Example: assuming 0 is neutral (hip origin). Adjust after observation.

    // Map human torso X position to robot base X
    const humanOffsetX = torsoCenterX - cameraCenterX;
    let robotBaseX = humanOffsetX * 1.0;

    // Map human torso Y position (vertical) to robot base Y
    const humanVerticalOffset = torsoCenterY - cameraCenterY;
    let robotBaseY = -humanVerticalOffset * 0.5;

    // Map human torso Z position to robot base Z (depth)
    let robotBaseZ_Positional = (humanNeutralZ - torsoCenterZ) * 1.5; // Renamed to avoid conflict with abs_z

    // Apply smoothing and clamp to robot limits
    robotBaseX = smooth('robot_base_x', robotBaseX);
    robotBaseY = smooth('robot_base_y', robotBaseY);
    robotBaseZ_Positional = smooth('robot_base_z_positional', robotBaseZ_Positional); // Smoothing for positional Z

    robotBaseX = Math.max(robotBaseXMin, Math.min(robotBaseXMax, robotBaseX));
    robotBaseY = Math.max(robotBaseYMin, Math.min(robotBaseYMax, robotBaseY));
    robotBaseZ_Positional = Math.max(robotBaseZMin, Math.min(robotBaseZMax, robotBaseZ_Positional));

    this.viewer?.updateJoint('base_x', robotBaseX);
    this.viewer?.updateJoint('base_y', robotBaseY);
    this.viewer?.updateJoint('base_z', robotBaseZ_Positional); // Note: Assuming 'base_z' controls positional depth

    if (this.debugMode) {
        console.log('Robot Base Movement (Based on Torso Center):', {
            robotBaseX: robotBaseX.toFixed(3) + ' (Left/Right)',
            robotBaseY: robotBaseY.toFixed(3) + ' (Up/Down)',
            robotBaseZ_Positional: robotBaseZ_Positional.toFixed(3) + ' (Forward/Backward)',
            humanOffsetX: humanOffsetX.toFixed(3),
            humanVerticalOffset: humanVerticalOffset.toFixed(3),
            humanDepthOffset: (humanNeutralZ - torsoCenterZ).toFixed(3),
            currentTorsoZ: torsoCenterZ.toFixed(4)
        });
    }

    // ... (rest of the code for arms, head, etc. if you have it)



    // ... (rest of the code for arms, head, etc. if you have it)
    // The previous abs_x and abs_y calculations are still relevant for torso *orientation*
    // independent of the overall torso position.


 */

// --- Right Leg Logic ---
const RIGHT_HIP = POSE.RIGHT_HIP; // Use POSE enum for consistency
const RIGHT_KNEE = POSE.RIGHT_KNEE;
const RIGHT_ANKLE = POSE.RIGHT_ANKLE;

if (isValid(poseLandmarks[RIGHT_HIP]) &&
    isValid(poseLandmarks[RIGHT_KNEE]) &&
    isValid(poseLandmarks[RIGHT_ANKLE])) {

    const hip = poseLandmarks[RIGHT_HIP];
    const knee = poseLandmarks[RIGHT_KNEE];
    const ankle = poseLandmarks[RIGHT_ANKLE];

    // Debugging logs for right leg
    if (this.debugMode) {
        console.groupCollapsed('Right Leg Debug (Raw Landmarks)');
        console.log(`R_Hip (24): x:${hip.x.toFixed(4)}, y:${hip.y.toFixed(4)}, z:${hip.z ? hip.z.toFixed(4) : 'N/A'}, vis:${hip.visibility ? hip.visibility.toFixed(4) : 'N/A'}`);
        console.log(`R_Knee (26): x:${knee.x.toFixed(4)}, y:${knee.y.toFixed(4)}, z:${knee.z ? knee.z.toFixed(4) : 'N/A'}, vis:${knee.visibility ? knee.visibility.toFixed(4) : 'N/A'}`);
        console.log(`R_Ankle (28): x:${ankle.x.toFixed(4)}, y:${ankle.y.toFixed(4)}, z:${ankle.z ? ankle.z.toFixed(4) : 'N/A'}, vis:${ankle.visibility ? ankle.visibility.toFixed(4) : 'N/A'}`);
        console.groupEnd();
    }

    // Calculate thigh vector and shin vector
    const thighVec = create2DVector(hip, knee);
    const shinVec = create2DVector(knee, ankle);

    // Calculate angles
    const thighAngle = angle2D(thighVec); // Angle of thigh vector relative to positive X axis
    const kneeAngle = angleBetweenVectors(thighVec, shinVec); // Internal angle at knee

    // R_HIP_Y: Side leg movement (Abduction/Adduction)
    // Positive legHorizontalOffset means knee moves to robot's right (human's left in mirrored view) which is abduction
    // Robot's r_hip_y: negative for abduction, positive for adduction
    let hipY = 0;
    const legHorizontalOffset = knee.x - hip.x; 
    const spreadSensitivity = 8.0; // from original code
    hipY = -legHorizontalOffset * spreadSensitivity; // Invert for mirrored movement
    hipY = smooth('r_hip_y', hipY);
    hipY = Math.max(-1.48, Math.min(1.83, hipY));

    // R_KNEE_Y: Knee bending
    let kneeY = 0;
    // Map human kneeAngle (PI for straight, 0 for bent) to robot knee_y (0.06 for straight, -2.34 for bent)
    kneeY = (-2.4 / Math.PI) * kneeAngle + 0.06;
    kneeY = smooth('r_knee_y', kneeY);
    kneeY = Math.max(-2.34, Math.min(0.06, kneeY));

    // R_ANKLE_Y: Ankle pitch (foot up/down)
    let ankleY = 0;
    const ankleRelativeY = ankle.y - knee.y; // Positive if ankle is below knee
    const ankleSensitivity = 5.0; // from original code
    ankleY = -ankleRelativeY * ankleSensitivity; // Invert to match typical ankle pitch
    ankleY = smooth('r_ankle_y', ankleY);
    ankleY = Math.max(-0.79, Math.min(0.79, ankleY));

    // Update robot joints for right leg
    // Removed: this.viewer?.updateJoint('r_hip_x', hipX);
    this.viewer?.updateJoint('r_hip_y', hipY);
    // Removed: this.viewer?.updateJoint('r_hip_z', hipZ);
    this.viewer?.updateJoint('r_knee_y', kneeY);
    this.viewer?.updateJoint('r_ankle_y', ankleY);

    if (this.debugMode) {
        console.log('2D Mapping Right Leg Results (Smoothed):', {
            thighAngle: (thighAngle * 180 / Math.PI).toFixed(1) + '°',
            kneeAngle: (kneeAngle * 180 / Math.PI).toFixed(1) + '°',
            // Removed: hipX: hipX.toFixed(3),
            hipY: hipY.toFixed(3),
            // Removed: hipZ: hipZ.toFixed(3),
            kneeY: kneeY.toFixed(3),
            ankleY: ankleY.toFixed(3)
        });
    }


} else {
    // If right leg landmarks are not valid, revert to initial pose values for stability.
    if (this.debugMode) console.warn("Invalid right leg landmarks, defaulting to initial pose for right leg.");
    this.viewer?.updateJoint('r_hip_x', this.initialRobotPose.r_hip_x); // Still defaulting, but no active calculation
    this.viewer?.updateJoint('r_hip_y', this.initialRobotPose.r_hip_y);
    this.viewer?.updateJoint('r_hip_z', this.initialRobotPose.r_hip_z); // Still defaulting, but no active calculation
    this.viewer?.updateJoint('r_knee_y', this.initialRobotPose.r_knee_y);
    this.viewer?.updateJoint('r_ankle_y', this.initialRobotPose.r_ankle_y);
}
       /* // --- Left Leg Logic ---
        const LEFT_HIP = POSE.LEFT_HIP; // Use POSE enum for consistency
        const LEFT_KNEE = POSE.LEFT_KNEE;
        const LEFT_ANKLE = POSE.LEFT_ANKLE;
    
        if (isValid(poseLandmarks[LEFT_HIP]) &&
            isValid(poseLandmarks[LEFT_KNEE]) &&
            isValid(poseLandmarks[LEFT_ANKLE])) {
    
            const hip = poseLandmarks[LEFT_HIP];
            const knee = poseLandmarks[LEFT_KNEE];
            const ankle = poseLandmarks[LEFT_ANKLE];
    
            if (this.debugMode) {
                console.groupCollapsed('Left Leg Debug (Raw Landmarks)');
                console.log(`L_Hip (23): x:${hip.x.toFixed(4)}, y:${hip.y.toFixed(4)}, z:${hip.z ? hip.z.toFixed(4) : 'N/A'}, vis:${hip.visibility ? hip.visibility.toFixed(4) : 'N/A'}`);
                console.log(`L_Knee (25): x:${knee.x.toFixed(4)}, y:${knee.y.toFixed(4)}, z:${knee.z ? knee.z.toFixed(4) : 'N/A'}, vis:${knee.visibility ? knee.visibility.toFixed(4) : 'N/A'}`);
                console.log(`L_Ankle (27): x:${ankle.x.toFixed(4)}, y:${ankle.y.toFixed(4)}, z:${ankle.z ? ankle.z.toFixed(4) : 'N/A'}, vis:${ankle.visibility ? ankle.visibility.toFixed(4) : 'N/A'}`);
                console.groupEnd();
            }
    
            const thighVec = create2DVector(hip, knee);
            const shinVec = create2DVector(knee, ankle);
    
            const thighAngle = angle2D(thighVec);
            const kneeAngle = angleBetweenVectors(thighVec, shinVec);
    
            // L_HIP_X: Forward/Backward leg movement (Sagittal plane)
            // Map thighAngle (approx 0 to PI) to l_hip_x (negative for backward, positive for forward, 0 for straight down)
            // Neutral (straight down) is PI/2
            // If human moves left leg forward (angle approaches 0), robot l_hip_x should be positive.
            // If human moves left leg backward (angle approaches PI), robot l_hip_x should be negative.
            // This is opposite of right leg.
            let hipX = (Math.PI / 2 - thighAngle) * 0.7; // Invert for left leg
            
            hipX = smooth('l_hip_x', hipX);
            hipX = Math.max(-0.52, Math.min(0.50, hipX)); // Clamped to robot limits (mirrored from right hip_x)
    
            // L_HIP_Y: Side leg movement (Abduction/Adduction)
            // Positive legHorizontalOffset means knee moves to the user's left (robot's right in mirrored view) which is abduction
            // Robot's l_hip_y: positive for abduction, negative for adduction
            let hipY = 0;
            const legHorizontalOffset = knee.x - hip.x; 
            const spreadSensitivity = 5.0;
            hipY = legHorizontalOffset * spreadSensitivity; 
            hipY = smooth('l_hip_y', hipY);
            hipY = Math.max(-1.83, Math.min(1.48, hipY)); // Clamped to robot limits (mirrored from right hip_y)
    
            // L_HIP_Z: Leg rotation (Internal/External rotation)
            let hipZ = 0;
            const ankleToKneeHorizontalOffset = ankle.x - knee.x;
            const hipZSensitivity = 2.0;
            hipZ = ankleToKneeHorizontalOffset * hipZSensitivity; 
            hipZ = smooth('l_hip_z', hipZ);
            hipZ = Math.max(-0.44, Math.min(1.57, hipZ)); // Clamped to robot limits (mirrored from right hip_z)
    
            // L_KNEE_Y: Knee bending
            let kneeY = 0;
            kneeY = (-2.4 / Math.PI) * kneeAngle + 0.06;
            kneeY = smooth('l_knee_y', kneeY);
            kneeY = Math.max(-2.34, Math.min(0.06, kneeY));
    
            // L_ANKLE_Y: Ankle pitch (foot up/down)
            let ankleY = 0;
            const ankleRelativeY = ankle.y - knee.y;
            const ankleSensitivity = 5.0;
            ankleY = -ankleRelativeY * ankleSensitivity;
            ankleY = smooth('l_ankle_y', ankleY);
            ankleY = Math.max(-0.79, Math.min(0.79, ankleY));
    
            // Update robot joints for left leg
            this.viewer?.updateJoint('l_hip_x', hipX);
            this.viewer?.updateJoint('l_hip_y', hipY);
            this.viewer?.updateJoint('l_hip_z', hipZ);
            this.viewer?.updateJoint('l_knee_y', kneeY);
            this.viewer?.updateJoint('l_ankle_y', ankleY);
    
            if (this.debugMode) {
                console.log('2D Mapping Left Leg Results (Smoothed):', {
                    thighAngle: (thighAngle * 180 / Math.PI).toFixed(1) + '°',
                    kneeAngle: (kneeAngle * 180 / Math.PI).toFixed(1) + '°',
                    hipX: hipX.toFixed(3),
                    hipY: hipY.toFixed(3),
                    hipZ: hipZ.toFixed(3),
                    kneeY: kneeY.toFixed(3),
                    ankleY: ankleY.toFixed(3)
                });
            }
    
        } else {
            // If left leg landmarks are not valid, revert to initial pose values for stability.
            if (this.debugMode) console.warn("Invalid left leg landmarks, defaulting to initial pose for left leg.");
            this.viewer?.updateJoint('l_hip_x', this.initialRobotPose.l_hip_x);
            this.viewer?.updateJoint('l_hip_y', this.initialRobotPose.l_hip_y);
            this.viewer?.updateJoint('l_hip_z', this.initialRobotPose.l_hip_z);
            this.viewer?.updateJoint('l_knee_y', this.initialRobotPose.l_knee_y);
            this.viewer?.updateJoint('l_ankle_y', this.initialRobotPose.l_ankle_y);
        }
*/

  // --- Left Hand Logic ---
        if (!isValid(poseLandmarks[POSE.LEFT_SHOULDER]) || 
            !isValid(poseLandmarks[POSE.LEFT_ELBOW]) || 
            !isValid(poseLandmarks[POSE.LEFT_WRIST])) {
            if (this.debugMode) console.warn("Invalid left hand landmarks, defaulting to initial pose for left arm.");
            // Use initial pose values as safe defaults if a limb is invalid
            this.viewer?.updateJoint('l_shoulder_x', this.initialRobotPose.l_shoulder_x);
            this.viewer?.updateJoint('l_shoulder_y', this.initialRobotPose.l_shoulder_y);
            this.viewer?.updateJoint('l_arm_z', this.initialRobotPose.l_arm_z);
            this.viewer?.updateJoint('l_elbow_y', this.initialRobotPose.l_elbow_y);
        } else {
            const shoulder = poseLandmarks[POSE.LEFT_SHOULDER];
            const elbow = poseLandmarks[POSE.LEFT_ELBOW];
            const wrist = poseLandmarks[POSE.LEFT_WRIST];

            if (this.debugMode) {
                console.groupCollapsed('Left Arm Debug (Raw Landmarks)');
                console.log(`L_Shoulder (11): x:${shoulder.x.toFixed(4)}, y:${shoulder.y.toFixed(4)}, z:${shoulder.z ? shoulder.z.toFixed(4) : 'N/A'}, vis:${shoulder.visibility ? shoulder.visibility.toFixed(4) : 'N/A'}`);
                console.log(`L_Elbow (13): x:${elbow.x.toFixed(4)}, y:${elbow.y.toFixed(4)}, z:${elbow.z ? elbow.z.toFixed(4) : 'N/A'}, vis:${elbow.visibility ? elbow.visibility.toFixed(4) : 'N/A'}`);
                console.log(`L_Wrist (15): x:${wrist.x.toFixed(4)}, y:${wrist.y.toFixed(4)}, z:${wrist.z ? wrist.z.toFixed(4) : 'N/A'}, vis:${wrist.visibility ? wrist.visibility.toFixed(4) : 'N/A'}`);
                console.groupEnd();
            }
    
            // === PURE 2D APPROACH ===
            
            // 1. Calculate upper arm vector (shoulder to elbow)
            const upperArmVec = create2DVector(shoulder, elbow);
            
            // 2. Calculate forearm vector (elbow to wrist)
            const forearmVec = create2DVector(elbow, wrist);
    
            const upperArmAngle = angle2D(upperArmVec); // Angle relative to horizontal
            
            // Calculate arm segment lengths for heuristic
            const upperArmLength = vectorMagnitude(upperArmVec);
            const forearmLength = vectorMagnitude(forearmVec);
            const totalArmLength = upperArmLength + forearmLength;
            
            // Add current length to history
            this.armLengthHistory_L.push(totalArmLength);
            if (this.armLengthHistory_L.length > 10) {
                this.armLengthHistory_L.shift(); // Keep only last 20 samples
            }
            
            // Calculate baseline as the maximum length seen (representing full extension sideways)
            const maxArmLength_L = Math.max(...this.armLengthHistory_L);
            
            // Calculate length ratio (current length / baseline length)
            const lengthRatio_L = totalArmLength / maxArmLength_L;
            
            const FORESHORTENING_THRESHOLD = 0.75; // This value might need tuning
            
            let shoulderX_L = 0;
            let isHandsFront_L = false;
            
            const isHorizontal_L = Math.abs(upperArmAngle) < Math.PI/3; // Within 60 degrees of horizontal
            
            if (this.debugMode) {
                console.log(`L_Arm Debug: totalArmLength_L: ${totalArmLength.toFixed(3)}, maxArmLength_L: ${maxArmLength_L.toFixed(3)}, lengthRatio_L: ${lengthRatio_L.toFixed(3)}`);
                console.log(`L_Arm Debug: isHorizontal_L: ${isHorizontal_L}, upperArmAngle: ${(upperArmAngle * 180 / Math.PI).toFixed(1)}°`);
            }

            if (isHorizontal_L && lengthRatio_L < FORESHORTENING_THRESHOLD && this.armLengthHistory_L.length > 10) {
                isHandsFront_L = true;
                shoulderX_L = 1.5; // Hands front, value 1.5
                if (this.debugMode) console.log("L_Arm Debug: isHandsFront_L DETECTED!");
            } else {
                if (this.debugMode) console.log("L_Arm Debug: isHandsFront_L NOT DETECTED.");
                // If not front, check for up/down or sideways
                const absAngle = Math.abs(upperArmAngle);
                if (absAngle > Math.PI/4) { // Arm significantly up or down
                    shoulderX_L = 1.5; // This implies arm is still somewhat "forward" or "up/down" motion
                } else { // Arm relatively horizontal, not detected as front, so assume sideways
                    const t = absAngle / (Math.PI/4); // 0 to 1, as arm moves from horizontal to 45 deg up/down
                    shoulderX_L = t * 1.5; // Interpolate between 0 (sideways) and 1.5 (more forward)
                }
            }
            
            shoulderX_L = smooth('l_shoulder_x', shoulderX_L);
            shoulderX_L = Math.max(-1.832, Math.min(1.919, shoulderX_L)); // Clamp to robot limits

            let shoulderY_L = 0;
            
            // Logic for l_shoulder_y (up/down movement)
            if (isHandsFront_L) {
                shoulderY_L = 0; // When hands are front, y-movement is less relevant, can default to 0
            } else {
                // Map upperArmVec.y (negative for up, positive for down in MediaPipe coords) 
                // to l_shoulder_y (negative for up, positive for down for robot)
                const verticalRatio = upperArmVec.y / upperArmLength; // This will be negative for up, positive for down
                shoulderY_L = verticalRatio * 1.5; // Scale to robot range
            }
            
            shoulderY_L = smooth('l_shoulder_y', shoulderY_L);
            shoulderY_L = Math.max(-2.094, Math.min(2.705, shoulderY_L)); // Clamp to robot limits
    
            let armZ_L = 0; // Currently not mapped from 2D pose, assumed to be 0 (neutral rotation)
            armZ_L = smooth('l_arm_z', armZ_L);
    
            // === LEFT ELBOW Y LOGIC ===
            let elbowY_L = 0;
            const currentElbowAngle_L = angleBetweenVectors(upperArmVec, forearmVec); // Angle at human elbow
            
            // As human elbow angle increases (flexes), robot's l_elbow_y decreases (goes negative)
            // 0.02 is straight, -2.58 is fully bent (from robot limits)
            elbowY_L = (-2.6 / Math.PI) * currentElbowAngle_L + 0.02; // Map 0-PI to 0.02 to -2.58 (approx -2.6 range)

            elbowY_L = smooth('l_elbow_y', elbowY_L);
            elbowY_L = Math.max(-2.58, Math.min(0.02, elbowY_L)); // Clamp to robot's actual limits
    
            // Update robot joints for left hand
            this.viewer?.updateJoint('l_shoulder_x', shoulderX_L);
            this.viewer?.updateJoint('l_shoulder_y', shoulderY_L);
            this.viewer?.updateJoint('l_arm_z', armZ_L);
            this.viewer?.updateJoint('l_elbow_y', elbowY_L);
    
            if (this.debugMode) {
                console.log('2D Mapping Left Hand Results (Smoothed):', {
                    currentElbowAngle: (currentElbowAngle_L * 180 / Math.PI).toFixed(1) + '°',
                    elbowY: elbowY_L.toFixed(3),
                    shoulderX: shoulderX_L.toFixed(3),
                    shoulderY: shoulderY_L.toFixed(3),
                    armZ: armZ_L.toFixed(3)
                });
            }
        }
    
        // --- Right Hand Logic ---
        if (!isValid(poseLandmarks[POSE.RIGHT_SHOULDER]) || 
            !isValid(poseLandmarks[POSE.RIGHT_ELBOW]) || 
            !isValid(poseLandmarks[POSE.RIGHT_WRIST])) {
            if (this.debugMode) console.warn("Invalid right hand landmarks, defaulting to initial pose for right arm.");
            // Use initial pose values as safe defaults if a limb is invalid
            this.viewer?.updateJoint('r_shoulder_x', this.initialRobotPose.r_shoulder_x);
            this.viewer?.updateJoint('r_shoulder_y', this.initialRobotPose.r_shoulder_y);
            this.viewer?.updateJoint('r_arm_z', this.initialRobotPose.r_arm_z);
            this.viewer?.updateJoint('r_elbow_y', this.initialRobotPose.r_elbow_y);
        } else {
            const shoulder_R = poseLandmarks[POSE.RIGHT_SHOULDER];
            const elbow_R = poseLandmarks[POSE.RIGHT_ELBOW];
            const wrist_R = poseLandmarks[POSE.RIGHT_WRIST];

            if (this.debugMode) {
                console.groupCollapsed('Right Arm Debug (Raw Landmarks)');
                console.log(`R_Shoulder (12): x:${shoulder_R.x.toFixed(4)}, y:${shoulder_R.y.toFixed(4)}, z:${shoulder_R.z ? shoulder_R.z.toFixed(4) : 'N/A'}, vis:${shoulder_R.visibility ? shoulder_R.visibility.toFixed(4) : 'N/A'}`);
                console.log(`R_Elbow (14): x:${elbow_R.x.toFixed(4)}, y:${elbow_R.y.toFixed(4)}, z:${elbow_R.z ? elbow_R.z.toFixed(4) : 'N/A'}, vis:${elbow_R.visibility ? elbow_R.visibility.toFixed(4) : 'N/A'}`);
                console.log(`R_Wrist (16): x:${wrist_R.x.toFixed(4)}, y:${wrist_R.y.toFixed(4)}, z:${wrist_R.z ? wrist_R.z.toFixed(4) : 'N/A'}, vis:${wrist_R.visibility ? wrist_R.visibility.toFixed(4) : 'N/A'}`);
                console.groupEnd();
            }
    
            const upperArmVec_R = create2DVector(shoulder_R, elbow_R);
            const forearmVec_R = create2DVector(elbow_R, wrist_R);
    
            const upperArmAngle_R = angle2D(upperArmVec_R); // Angle relative to horizontal
            
            const upperArmLength_R = vectorMagnitude(upperArmVec_R);
            const forearmLength_R = vectorMagnitude(forearmVec_R);
            const totalArmLength_R = upperArmLength_R + forearmLength_R;
            
            this.armLengthHistory_R.push(totalArmLength_R);
            if (this.armLengthHistory_R.length > 20) {
                this.armLengthHistory_R.shift();
            }
            
            const maxArmLength_R = Math.max(...this.armLengthHistory_R);
            const lengthRatio_R = totalArmLength_R / maxArmLength_R;
            
            const FORESHORTENING_THRESHOLD = 0.75; // Can be tuned, potentially different for left/right
            
            let shoulderX_R = 0;
            let isHandsFront_R = false;
            
            const isHorizontal_R = Math.abs(upperArmAngle_R) < Math.PI/3;

            if (this.debugMode) {
                console.log(`R_Arm Debug: totalArmLength_R: ${totalArmLength_R.toFixed(3)}, maxArmLength_R: ${maxArmLength_R.toFixed(3)}, lengthRatio_R: ${lengthRatio_R.toFixed(3)}`);
                console.log(`R_Arm Debug: isHorizontal_R: ${isHorizontal_R}, upperArmAngle_R: ${(upperArmAngle_R * 180 / Math.PI).toFixed(1)}°`);
            }
            
            if (isHorizontal_R && lengthRatio_R < FORESHORTENING_THRESHOLD && this.armLengthHistory_R.length > 10) {
                isHandsFront_R = true;
                shoulderX_R = 1.5; // From table: r_shoulder_x (1.5) for Hands Front
                if (this.debugMode) console.log("R_Arm Debug: isHandsFront_R DETECTED!");
            } else {
                if (this.debugMode) console.log("R_Arm Debug: isHandsFront_R NOT DETECTED.");
                // This block is executed if arm is not detected as "front" by foreshortening
                // For right arm, upperArmAngle_R near +/- PI (180deg) means sideways.
                // Calculate shortest angular distance to either 0 or PI (horizontal axes)
                const angleRelativeToNearestHorizontalAxis = Math.min(
                    Math.abs(upperArmAngle_R),
                    Math.abs(upperArmAngle_R - Math.PI),
                    Math.abs(upperArmAngle_R + Math.PI)
                );

                if (angleRelativeToNearestHorizontalAxis > Math.PI/4) { // Arm significantly up or down relative to horizontal
                    shoulderX_R = 1.5; // This implies arm is still somewhat "forward" or "up/down" motion
                } else { // Arm relatively horizontal (near 0 or +/- PI), not detected as front, so assume sideways
                    const t = angleRelativeToNearestHorizontalAxis / (Math.PI/4); // 0 to 1, as arm moves from horizontal to 45 deg up/down
                    shoulderX_R = t * 1.5; // Interpolate between 0 (sideways) and 1.5 (more forward)
                }
            }
            
            shoulderX_R = smooth('r_shoulder_x', shoulderX_R);
            shoulderX_R = Math.max(-1.919, Math.min(1.832, shoulderX_R)); // Right shoulder_x limits

            let shoulderY_R = 0;
            
            // Logic for r_shoulder_y (up/down movement)
            if (isHandsFront_R) {
                shoulderY_R = 0; // When hands are front, y-movement is less relevant, can default to 0
            } else {
                // Map upperArmVec_R.y (negative for up, positive for down in MediaPipe coords) 
                // to r_shoulder_y (positive for up, negative for down for robot) - inverted from left arm
                const verticalRatio_R = upperArmVec_R.y / upperArmLength_R; // Negative for up, positive for down
                shoulderY_R = -verticalRatio_R * 1.5; // Invert the sign for the right arm's convention
            }
            
            shoulderY_R = smooth('r_shoulder_y', shoulderY_R);
            shoulderY_R = Math.max(-2.705, Math.min(2.094, shoulderY_R)); // Right shoulder_y limits
    
            let armZ_R = 0; // Currently not mapped from 2D pose, assumed to be 0 (neutral rotation)
            armZ_R = smooth('r_arm_z', armZ_R);
    
            // === RIGHT ELBOW Y LOGIC (Already seems consistent with mirrored joint) ===
            let elbowY_R = 0; 
            const currentElbowAngle_R = angleBetweenVectors(upperArmVec_R, forearmVec_R); // Angle at human elbow

            // This mapping means as human elbow angle increases (flexes), robot's r_elbow_y increases.
            // This is consistent with a mirrored joint if l_elbow_y decreases for flexion.
            elbowY_R = (2.6 / Math.PI) * currentElbowAngle_R - 0.02; // Map 0-PI to -0.02 to 2.58 (approx 2.6 range)
            
            elbowY_R = smooth('r_elbow_y', elbowY_R);
            elbowY_R = Math.max(-0.02, Math.min(2.58, elbowY_R)); // Clamp to robot's actual limits
    
            // Update robot joints for right hand
            this.viewer?.updateJoint('r_shoulder_x', shoulderX_R);
            this.viewer?.updateJoint('r_shoulder_y', shoulderY_R);
            this.viewer?.updateJoint('r_arm_z', armZ_R);
            this.viewer?.updateJoint('r_elbow_y', elbowY_R);
    
            if (this.debugMode) {
                console.log('2D Mapping Right Hand Results (Smoothed):', {
                    currentElbowAngle: (currentElbowAngle_R * 180 / Math.PI).toFixed(1) + '°',
                    elbowY: elbowY_R.toFixed(3),
                    shoulderX: shoulderX_R.toFixed(3),
                    shoulderY: shoulderY_R.toFixed(3),
                    armZ: armZ_R.toFixed(3)
                });
            }
        }
    
                            
    }
    
} // End of MediaPipeHandController class