import React, { useState, useRef, useEffect } from "react";

type TaskStatus = "TO-DO" | "IN-PROGRESS" | "COMPLETED";
type TaskCategory = "Work" | "Personal";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
  createdAt: string;
  userId: string;
  order?: number;
  attachment?: string;
}

interface NewTaskInput {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
  attachment?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  taskId: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: string;
  category?: string;
  attachment?: string;
}

interface EditTaskProps {
  task: Task;
  onSave: (updatedTask: NewTaskInput) => void;
  onCancel: () => void;
}

const EditTask: React.FC<EditTaskProps> = ({ task, onSave, onCancel }) => {
  const [updatedTask, setUpdatedTask] = useState<NewTaskInput>({
    title: task.title,
    description: task.description || "",
    dueDate: task.dueDate,
    status: task.status,
    category: task.category,
    attachment: task.attachment,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    task.attachment || null
  );

  const initializeLogs = () => {
    const storedLogs = localStorage.getItem(`taskLogs_${task.id}`);
    if (storedLogs) {
      return JSON.parse(storedLogs);
    }
    const initialLog = {
      id: "1",
      action: "Task created",
      timestamp: new Date(task.createdAt).toLocaleString(),
      taskId: task.id,
    };
    localStorage.setItem(`taskLogs_${task.id}`, JSON.stringify([initialLog]));
    return [initialLog];
  };

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initializeLogs);

  useEffect(() => {
    localStorage.setItem(`taskLogs_${task.id}`, JSON.stringify(activityLogs));
  }, [activityLogs, task.id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Title validation - Special characters check
    if (!updatedTask.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (/[^a-zA-Z0-9 ]/.test(updatedTask.title)) {
      newErrors.title = "Title must not contain special characters";
      isValid = false;
    } else if (updatedTask.title.length > 50) {
      newErrors.title = "Title must be less than 50 characters";
      isValid = false;
    }

    // Description validation
    if (updatedTask.description.length > 300) {
      newErrors.description = "Description must be less than 300 characters";
      isValid = false;
    }

    // Category validation
    if (!updatedTask.category) {
      newErrors.category = "Category is required";
      isValid = false;
    }

    // Due date validation - Check if it's selected and is a future date
    if (!updatedTask.dueDate) {
      newErrors.dueDate = "Due date is required";
      isValid = false;
    } else {
      const selectedDate = new Date(updatedTask.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.dueDate = "Due date must be a future date";
        isValid = false;
      }
    }

    // Status validation
    if (!updatedTask.status) {
      newErrors.status = "Status is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const addActivityLog = (
    changes: Array<{ field: string; oldValue: string; newValue: string }>
  ) => {
    const newLogs = changes.map((change) => ({
      id: Date.now().toString() + Math.random(),
      action: `Changed ${change.field} from "${change.oldValue}" to "${change.newValue}"`,
      timestamp: new Date().toLocaleString(),
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      taskId: task.id,
    }));

    setActivityLogs((prev) => [...newLogs, ...prev]);
  };

  const handleInputChange = (field: keyof NewTaskInput, value: string) => {
    setUpdatedTask((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          attachment: "Please upload only image files",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          attachment: "File size must be less than 5MB",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setUpdatedTask((prev) => ({ ...prev, attachment: result }));
        // Clear error when valid file is uploaded
        setErrors((prev) => ({ ...prev, attachment: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const changes = [];

    if (task.title !== updatedTask.title) {
      changes.push({
        field: "Title",
        oldValue: task.title,
        newValue: updatedTask.title,
      });
    }

    if ((task.description || "") !== updatedTask.description) {
      changes.push({
        field: "Description",
        oldValue: task.description || "",
        newValue: updatedTask.description,
      });
    }

    if (task.dueDate !== updatedTask.dueDate) {
      changes.push({
        field: "Due Date",
        oldValue: task.dueDate,
        newValue: updatedTask.dueDate,
      });
    }

    if (task.status !== updatedTask.status) {
      changes.push({
        field: "Status",
        oldValue: task.status,
        newValue: updatedTask.status,
      });
    }

    if (task.category !== updatedTask.category) {
      changes.push({
        field: "Category",
        oldValue: task.category,
        newValue: updatedTask.category,
      });
    }

    if (task.attachment !== updatedTask.attachment) {
      changes.push({
        field: "Attachment",
        oldValue: "previous file",
        newValue: "new file",
      });
    }

    if (changes.length > 0) {
      addActivityLog(changes);
    }

    onSave(updatedTask);
  };

  return (
    <div className="flex gap-6 max-w-7xl mx-auto bg-white">
      <div className="flex-1 p-6" style={{ maxWidth: "900px" }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={updatedTask.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`w-full px-4 py-2.5 text-lg border rounded-2xl focus:outline-none focus:ring-1 focus:ring-purple-600 ${
                errors.title ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Morning Workout"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <textarea
              value={updatedTask.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`w-full px-4 py-2.5 h-20 resize-none focus:outline-none ${
                errors.description ? "border-red-500" : ""
              }`}
              placeholder="Add Description"
              maxLength={300}
            />
            <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100">
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                <strong>B</strong>
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                <s>S</s>
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                •
              </button>
              <button type="button" className="p-1.5 hover:bg-gray-100 rounded">
                1.
              </button>
              <div className="ml-auto text-gray-400 text-sm">
                {updatedTask.description.length}/300 characters
              </div>
            </div>
            {errors.description && <p className="px-4 py-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Task Category*</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("category", "Work")}
                  className={`px-6 py-1.5 rounded-full text-sm transition-colors ${
                    updatedTask.category === "Work"
                      ? "bg-purple-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Work
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("category", "Personal")}
                  className={`px-6 py-1.5 rounded-full text-sm transition-colors ${
                    updatedTask.category === "Personal"
                      ? "bg-purple-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Personal
                </button>
              </div>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Due on*</label>
                <div className="relative">
                  <input
                    type="date"
                    value={updatedTask.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    className={`w-full pl-4 pr-4 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600 ${
                      errors.dueDate ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.dueDate && <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Task Status*</label>
                <select
                  value={updatedTask.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className={`w-full px-4 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white ${
                    errors.status ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="TO-DO">TO-DO</option>
                  <option value="IN-PROGRESS">IN-PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Attachment</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer hover:border-purple-600 transition-colors ${
                errors.attachment ? "border-red-500" : "border-gray-200"
              }`}
            >
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded"
                  />
                  <p className="text-sm text-gray-500 mt-2">Click to change image</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Drop your files here or <span className="text-purple-600">click to upload</span>
                </p>
              )}
            </div>
            {errors.attachment && <p className="mt-1 text-sm text-red-500">{errors.attachment}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-1.5 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              SAVE
            </button>
          </div>
        </form>
      </div>

      <div className="w-96 border-l-2 border-gray-100">
        <div className="text-center pt-6 text-sm text-gray-600">Activity Logs</div>
        <div className="space-y-3 mt-6 px-6">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-2 py-2.5 border-b border-gray-100">
              <div className="text-xs text-gray-400">{log.timestamp}</div>
              <div className="text-sm text-gray-700">
                {log.action} {log.field && `(${log.field})`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditTask;
