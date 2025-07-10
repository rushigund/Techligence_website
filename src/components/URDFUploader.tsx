import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { urdfAPI } from "@/services/api";

interface URDFUploaderProps {
  onURDFLoad: (urdfData: string, filename: string) => void;
  className?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  data: string;
  uploadedAt: Date;
  isValid: boolean;
  errorMessage?: string;
  id?: string;
  serverFile?: any;
}

const URDFUploader: React.FC<URDFUploaderProps> = ({
  onURDFLoad,
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  const validateURDF = (content: string, filename: string): boolean => {
    // Basic URDF validation
    const hasRobotTag = content.includes("<robot");
    const hasLinkTag = content.includes("<link");
    const hasJointTag = content.includes("<joint") || content.includes("<link"); // Links are enough for simple models
    const isXMLLike = content.trim().startsWith("<");

    if (!isXMLLike) {
      throw new Error("File doesn't appear to be a valid XML/URDF file");
    }

    if (!hasRobotTag) {
      throw new Error("URDF file must contain a <robot> tag");
    }

    if (!hasLinkTag) {
      throw new Error("URDF file must contain at least one <link> tag");
    }

    return true;
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const isValid = validateURDF(content, file.name);

          const processedFile: UploadedFile = {
            name: file.name,
            size: file.size,
            data: content,
            uploadedAt: new Date(),
            isValid,
          };

          resolve(processedFile);
        } catch (error) {
          const processedFile: UploadedFile = {
            name: file.name,
            size: file.size,
            data: "",
            uploadedAt: new Date(),
            isValid: false,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          };
          resolve(processedFile);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  };

  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      setIsUploading(true);
      setUploadProgress(0);

      const fileArray = Array.from(files);
      const urdfFiles = fileArray.filter(
        (file) =>
          file.name.toLowerCase().endsWith(".urdf") ||
          file.name.toLowerCase().endsWith(".xml"),
      );

      if (urdfFiles.length === 0) {
        alert("Please select URDF (.urdf) or XML files only");
        setIsUploading(false);
        return;
      }

      try {
        console.log(`📁 Uploading ${urdfFiles.length} URDF file(s)...`);

        for (let i = 0; i < urdfFiles.length; i++) {
          const file = urdfFiles[i];
          const progressBase = (i / urdfFiles.length) * 100;
          setUploadProgress(progressBase);

          console.log(
            `📤 Uploading: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
          );

          // Check file size (max 50MB to match backend)
          if (file.size > 50 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum size is 50MB.`);
            continue;
          }

          try {
            // Determine robot type and category from filename or set defaults
            const robotType = file.name.toLowerCase().includes("humanoid")
              ? "humanoid"
              : "4wd";
            const category = "research"; // Default category

            const response = await urdfAPI.uploadFile(file, {
              robotType,
              category,
              name: file.name.replace(/\.[^/.]+$/, ""),
              description: `Uploaded URDF file: ${file.name}`,
            });

            console.log(`✅ Upload successful: ${file.name}`);
            const uploadedFile = response.data.data;

            // Convert to local format for compatibility
            const processedFile: UploadedFile = {
              name: uploadedFile.filename || uploadedFile.name || file.name,
              size: uploadedFile.size || uploadedFile.fileSize || file.size,
              data: uploadedFile.content || "", // Store content from demo API
              uploadedAt: new Date(
                uploadedFile.uploadedAt || uploadedFile.createdAt || new Date(),
              ),
              isValid: uploadedFile.validation?.isValid ?? true, // Assume valid in demo mode
              errorMessage: uploadedFile.validation?.errors?.join(", ") || "",
              id: uploadedFile.id || uploadedFile._id || `demo-${Date.now()}`,
              serverFile: uploadedFile,
            };

            setUploadedFiles((prev) => [...prev, processedFile]);

            // Auto-select the first valid file and load content immediately
            if (processedFile.isValid) {
              setSelectedFile(processedFile);

              // If content is already available from demo API, use it immediately
              if (processedFile.data) {
                console.log(
                  `🎯 Auto-loading URDF content for 3D visualization: ${processedFile.name}`,
                );
                onURDFLoad(processedFile.data, processedFile.name);
              } else {
                // For real files, read the content to pass to the 3D viewer
                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target?.result as string;
                  if (content) {
                    processedFile.data = content; // Store content in the file object
                    console.log(
                      `🎯 Auto-loading URDF content for 3D visualization: ${processedFile.name}`,
                    );
                    onURDFLoad(content, processedFile.name);
                  }
                };
                reader.readAsText(file);
              }
            }
          } catch (uploadError: any) {
            console.error(`Failed to upload ${file.name}:`, uploadError);
            const errorMessage =
              uploadError.response?.data?.message ||
              uploadError.message ||
              "Unknown upload error";

            // Show user-friendly error message
            setUploadedFiles((prev) => [
              ...prev,
              {
                name: file.name,
                size: file.size,
                data: "",
                uploadedAt: new Date(),
                isValid: false,
                errorMessage: `Upload failed: ${errorMessage}`,
                id: `error-${Date.now()}`,
                serverFile: null,
              },
            ]);
          }

          setUploadProgress(((i + 1) / urdfFiles.length) * 100);
        }
      } catch (error) {
        console.error("Error processing files:", error);
        alert("Error processing files. Please try again.");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [onURDFLoad, selectedFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("Files selected:", files);
    if (files && files.length > 0) {
      console.log("Processing", files.length, "files");
      handleFileUpload(files);
    } else {
      console.log("No files selected");
    }
    // Reset the input value to allow re-uploading the same file
    e.target.value = "";
  };

  const selectFile = async (file: UploadedFile) => {
    if (file.isValid) {
      setSelectedFile(file);

      // If we have the content already, use it
      if (file.data) {
        console.log(`🎯 Loading cached URDF content: ${file.name}`);
        onURDFLoad(file.data, file.name);
      } else if (file.serverFile?.content) {
        // If it's from demo API, use the content from server response
        console.log(`🎯 Loading URDF content from server: ${file.name}`);
        onURDFLoad(file.serverFile.content, file.name);
      } else {
        // For real server files, we might need to fetch the content
        console.log(`🔄 Loading URDF content for: ${file.name}`);
        try {
          // This would be used with real API to fetch file content
          // For now, we'll use a placeholder since demo mode provides content
          onURDFLoad(
            file.data ||
              `<!-- URDF content for ${file.name} would be loaded here -->`,
            file.name,
          );
        } catch (error) {
          console.error("Failed to load URDF content:", error);
        }
      }
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
    if (selectedFile?.name === fileName) {
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            URDF Model Upload
          </CardTitle>
          <CardDescription>
            Upload your robot's URDF file to visualize and control it in 3D
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              isUploading && "pointer-events-none opacity-50",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mx-auto max-w-sm space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>

              <div>
                <p className="text-lg font-medium mb-2">
                  Drop your URDF files here
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  or click to browse your computer
                </p>
              </div>

              <div>
                <Button
                  variant="outline"
                  className="gap-2 cursor-pointer"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <FileText className="w-4 h-4" />
                  Choose Files
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".urdf,.xml"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Supports .urdf and .xml files up to 10MB
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample URDF Files */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Sample URDF Files
          </CardTitle>
          <CardDescription>
            Try these sample robot models if you don't have your own URDF files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start gap-2 h-auto p-4"
              onClick={() => {
                // Load sample 4WD robot URDF
                const sampleURDF = `<?xml version="1.0"?>
<robot name="sample_4wd_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="2.0 1.0 2.0"/>
      </geometry>
      <material name="blue">
        <color rgba="0.149 0.392 0.922 1"/>
      </material>
    </visual>
  </link>

  <link name="wheel_fl">
    <visual>
      <geometry>
        <cylinder radius="0.3" length="0.3"/>
      </geometry>
      <material name="black">
        <color rgba="0.122 0.165 0.220 1"/>
      </material>
    </visual>
  </link>

  <joint name="wheel_fl_joint" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_fl"/>
    <origin xyz="-1.2 0.3 1.2"/>
    <axis xyz="0 0 1"/>
  </joint>
</robot>`;
                onURDFLoad(sampleURDF, "sample_4wd_robot.urdf");
              }}
            >
              <FileText className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">4WD Robot</div>
                <div className="text-xs text-muted-foreground">
                  Basic 4-wheel drive robot
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-2 h-auto p-4"
              onClick={() => {
                // Create and download a test URDF file
                const testURDF = `<?xml version="1.0"?>
<robot name="test_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="1.0 1.0 1.0"/>
      </geometry>
      <material name="red">
        <color rgba="0.8 0.2 0.2 1"/>
      </material>
    </visual>
  </link>
</robot>`;
                const blob = new Blob([testURDF], { type: "application/xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "test_robot.urdf";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Download Test</div>
                <div className="text-xs text-muted-foreground">
                  Test URDF file for upload
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-2 h-auto p-4"
              onClick={() => {
                // Load sample humanoid URDF
                const sampleURDF = `<?xml version="1.0"?>
<robot name="sample_humanoid">
  <link name="torso">
    <visual>
      <geometry>
        <box size="0.5 1.0 0.3"/>
      </geometry>
      <material name="green">
        <color rgba="0.022 0.588 0.412 1"/>
      </material>
    </visual>
  </link>

  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.2"/>
      </geometry>
      <material name="skin">
        <color rgba="0.988 0.863 0.745 1"/>
      </material>
    </visual>
  </link>

  <joint name="neck_joint" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0.6 0"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
  </joint>
</robot>`;
                onURDFLoad(sampleURDF, "sample_humanoid.urdf");
              }}
            >
              <FileText className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Humanoid Robot</div>
                <div className="text-xs text-muted-foreground">
                  Basic humanoid structure
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Uploaded Files ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    file.isValid
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
                    selectedFile?.name === file.name &&
                      "ring-2 ring-primary ring-offset-2",
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        file.isValid
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-red-100 dark:bg-red-900",
                      )}
                    >
                      {file.isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{file.name}</p>
                        {selectedFile?.name === file.name && (
                          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} •{" "}
                        {file.uploadedAt.toLocaleTimeString()}
                      </p>
                      {!file.isValid && file.errorMessage && (
                        <Alert className="mt-2 p-2">
                          <AlertCircle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            {file.errorMessage}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.isValid && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => selectFile(file)}
                        disabled={selectedFile?.name === file.name}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default URDFUploader;
