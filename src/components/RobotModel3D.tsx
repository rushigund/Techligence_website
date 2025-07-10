import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import { URDFLoader, URDFRobot } from "@/services/urdfLoader";

interface RobotModelProps {
  gestureData: {
    landmarks: any[];
    isHandDetected: boolean;
    gestureType: "pinch" | "open" | "fist" | "point" | "idle";
    handPosition: { x: number; y: number; z: number };
    confidence: number;
  };
  urdfData?: string;
}

interface RobotPart {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  color: string;
}

const SimpleRobot = ({ gestureData }: { gestureData: any }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  useFrame((state) => {
    if (!groupRef.current) return;

    const { handPosition, gestureType, isHandDetected } = gestureData;

    if (isHandDetected) {
      // Move robot to follow hand position
      const targetX = (handPosition.x - 0.5) * 8;
      const targetY = (0.5 - handPosition.y) * 4 + 1;

      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.1,
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.1,
      );

      // Gesture-based actions
      switch (gestureType) {
        case "open":
          groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
          groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            0,
            0.05,
          );
          break;

        case "pinch":
          groupRef.current.rotation.y += 0.03;
          setWheelRotation((prev) => prev + 0.1);
          break;

        case "fist":
          groupRef.current.rotation.x =
            Math.sin(state.clock.elapsedTime * 2) * 0.1;
          break;

        case "point":
          groupRef.current.rotation.z =
            Math.sin(state.clock.elapsedTime * 3) * 0.15;
          break;

        default:
          groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            0,
            0.1,
          );
          groupRef.current.rotation.z = THREE.MathUtils.lerp(
            groupRef.current.rotation.z,
            0,
            0.1,
          );
          break;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Robot Base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 1.5]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>

      {/* Wheels */}
      {[
        [-1.2, 0.3, 1.0],
        [1.2, 0.3, 1.0],
        [-1.2, 0.3, -1.0],
        [1.2, 0.3, -1.0],
      ].map((position, index) => (
        <mesh key={index} position={position} rotation={[0, 0, wheelRotation]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}

      {/* Sensor Tower */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color="#059669" />
      </mesh>

      {/* Camera */}
      <mesh position={[0, 2.2, 0.2]}>
        <boxGeometry args={[0.2, 0.15, 0.1]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Status indicators */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.08]} />
        <meshBasicMaterial
          color={gestureData.isHandDetected ? "#00ff00" : "#ff0000"}
        />
      </mesh>

      {/* Lighting */}
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#00ff88" />
    </group>
  );
};

const URDFRobotComponent = ({
  gestureData,
  urdfRobot,
}: {
  gestureData: any;
  urdfRobot: URDFRobot;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const robotRef = useRef<URDFRobot>(urdfRobot);

  useEffect(() => {
    robotRef.current = urdfRobot;
  }, [urdfRobot]);

  useFrame((state) => {
    if (!groupRef.current || !robotRef.current) return;

    const { handPosition, gestureType, isHandDetected } = gestureData;

    if (isHandDetected) {
      // Move robot to follow hand position
      const targetX = (handPosition.x - 0.5) * 8;
      const targetY = (0.5 - handPosition.y) * 4 + 1;

      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.1,
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.1,
      );

      // Gesture-based joint animations
      const time = state.clock.elapsedTime;
      const joints = robotRef.current.joints;

      switch (gestureType) {
        case "open":
          // Gentle swaying motion
          groupRef.current.rotation.y = Math.sin(time) * 0.1;

          // Animate any wheel joints
          Object.keys(joints).forEach((jointName) => {
            if (jointName.includes("wheel")) {
              joints[jointName].setAngle(time * 0.5);
            }
          });
          break;

        case "pinch":
          // Rotate entire robot and animate wheels
          groupRef.current.rotation.y += 0.03;

          Object.keys(joints).forEach((jointName) => {
            if (jointName.includes("wheel")) {
              joints[jointName].setAngle(time * 2);
            }
          });
          break;

        case "fist":
          // Tilt and animate joints
          groupRef.current.rotation.x = Math.sin(time * 2) * 0.1;

          Object.keys(joints).forEach((jointName) => {
            if (jointName.includes("joint") && !jointName.includes("wheel")) {
              joints[jointName].setAngle(Math.sin(time * 3) * 0.2);
            }
          });
          break;

        case "point":
          // Oscillating movements
          groupRef.current.rotation.z = Math.sin(time * 3) * 0.15;

          Object.keys(joints).forEach((jointName) => {
            if (joints[jointName].type === "revolute") {
              const limit = joints[jointName].limit;
              if (limit) {
                const range = (limit.upper - limit.lower) * 0.3; // Use 30% of joint range
                const center = (limit.upper + limit.lower) / 2;
                joints[jointName].setAngle(center + Math.sin(time * 2) * range);
              }
            }
          });
          break;

        default:
          // Return to neutral position
          groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            0,
            0.1,
          );
          groupRef.current.rotation.z = THREE.MathUtils.lerp(
            groupRef.current.rotation.z,
            0,
            0.1,
          );

          // Reset joints to neutral
          Object.keys(joints).forEach((jointName) => {
            if (!jointName.includes("wheel")) {
              joints[jointName].setAngle(
                THREE.MathUtils.lerp(joints[jointName].angle, 0, 0.05),
              );
            }
          });
          break;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={urdfRobot} />
    </group>
  );
};

const CameraController = ({ gestureData }: { gestureData: any }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (gestureData.isHandDetected && gestureData.gestureType === "fist") {
      // Zoom camera when fist gesture is detected
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8, 0.05);
    } else {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 12, 0.05);
    }
  });

  return null;
};

const LoadingSpinner = () => (
  <Text
    position={[0, 0, 0]}
    fontSize={0.5}
    color="#94a3b8"
    anchorX="center"
    anchorY="middle"
  >
    Loading URDF model...
  </Text>
);

const RobotModel3D: React.FC<RobotModelProps> = ({ gestureData, urdfData }) => {
  const [showGrid, setShowGrid] = useState(true);
  const [urdfRobot, setUrdfRobot] = useState<URDFRobot | null>(null);
  const [isLoadingURDF, setIsLoadingURDF] = useState(false);
  const [urdfError, setUrdfError] = useState<string | null>(null);

  // Load URDF when urdfData changes
  useEffect(() => {
    if (urdfData && urdfData.trim().length > 0) {
      console.log("🔄 Loading URDF model into 3D viewer...");
      console.log("📄 URDF preview:", urdfData.substring(0, 200) + "...");
      setIsLoadingURDF(true);
      setUrdfError(null);

      const loadURDF = async () => {
        try {
          // Validate URDF format first
          if (!urdfData.includes("<robot")) {
            throw new Error("Invalid URDF: Missing <robot> tag");
          }

          if (!urdfData.includes("<link")) {
            throw new Error("Invalid URDF: No <link> elements found");
          }

          const loader = new URDFLoader();
          const robot = await loader.parseURDF(urdfData);

          const linkCount = Object.keys(robot.links).length;
          const jointCount = Object.keys(robot.joints).length;

          console.log("✅ URDF model loaded successfully!");
          console.log(
            `📊 Robot stats: ${linkCount} links, ${jointCount} joints`,
          );
          console.log("🔗 Links:", Object.keys(robot.links));
          console.log("⚙️ Joints:", Object.keys(robot.joints));

          if (linkCount === 0) {
            throw new Error("No valid links were parsed from URDF");
          }

          setUrdfRobot(robot);
          setUrdfError(null);
        } catch (error) {
          console.error("❌ Failed to load URDF model:", error);
          setUrdfError(
            error instanceof Error
              ? error.message
              : "Unknown error loading URDF",
          );
          setUrdfRobot(null);
        } finally {
          setIsLoadingURDF(false);
        }
      };

      // Add a small delay to show loading state
      setTimeout(loadURDF, 100);
    } else {
      console.log("🔄 No URDF data provided, using default robot");
      setUrdfRobot(null);
      setUrdfError(null);
      setIsLoadingURDF(false);
    }
  }, [urdfData]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="px-3 py-1 bg-black/50 text-white rounded text-sm hover:bg-black/70 transition-colors"
        >
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button>
      </div>

      {/* Gesture Status */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white p-3 rounded text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`w-2 h-2 rounded-full ${
              gestureData.isHandDetected ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span>
            {gestureData.isHandDetected ? "Hand Detected" : "No Hand"}
          </span>
        </div>
        <div>Gesture: {gestureData.gestureType}</div>
        <div>Confidence: {(gestureData.confidence * 100).toFixed(0)}%</div>
      </div>

      {/* Model Status */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 text-white p-3 rounded text-sm">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              urdfRobot
                ? "bg-green-400"
                : isLoadingURDF
                  ? "bg-yellow-400 animate-pulse"
                  : urdfError
                    ? "bg-red-400"
                    : "bg-blue-400"
            }`}
          />
          <span>
            {isLoadingURDF
              ? "Loading URDF..."
              : urdfRobot
                ? "URDF Model"
                : urdfError
                  ? "URDF Error"
                  : "Default Robot"}
          </span>
        </div>
        {urdfRobot && (
          <div className="text-xs mt-1 text-gray-300">
            {Object.keys(urdfRobot.links).length} links ���{" "}
            {Object.keys(urdfRobot.joints).length} joints
          </div>
        )}
        {urdfError && (
          <div className="text-xs mt-1 text-red-300 max-w-xs">{urdfError}</div>
        )}
      </div>

      <Canvas
        camera={{ position: [8, 6, 12], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />

          {/* Environment */}
          <Environment preset="city" />

          {/* Grid */}
          {showGrid && (
            <Grid
              args={[20, 20]}
              position={[0, 0, 0]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6366f1"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#8b5cf6"
              fadeDistance={25}
              fadeStrength={1}
            />
          )}

          {/* Robot Model - either URDF or default */}
          {isLoadingURDF ? (
            <LoadingSpinner />
          ) : urdfRobot ? (
            <URDFRobotComponent
              gestureData={gestureData}
              urdfRobot={urdfRobot}
            />
          ) : (
            <SimpleRobot gestureData={gestureData} />
          )}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />

          {/* Camera Controller */}
          <CameraController gestureData={gestureData} />

          {/* Instructions Text */}
          <Text
            position={[0, -3, 0]}
            fontSize={0.5}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            {urdfRobot
              ? "Custom URDF model loaded"
              : "Use hand gestures to control the robot"}
          </Text>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RobotModel3D;
