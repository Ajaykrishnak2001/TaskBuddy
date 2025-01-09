import React, { useState } from 'react';
import { X, Bold, Strikethrough, List, AlignLeft } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';

type TaskStatus = "TO-DO" | "IN-PROGRESS" | "COMPLETED";
type TaskCategory = "Work" | "Personal";

interface CreateTaskModalProps {
  onClose: () => void;
  userId: string;
  onTaskAdded?: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  category: TaskCategory;
  status: TaskStatus;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
}
const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, userId, onTaskAdded }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    category: 'Work',
    status: 'TO-DO'
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (/[^a-zA-Z0-9 ]/.test(formData.title)) {
      newErrors.title = 'Title must not contain special characters';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'description') {
      setCharacterCount(value.length);
    }

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFilesDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const taskData = {
        ...formData,
        userId,
        createdAt: new Date().toISOString(),
        hasAttachments: attachments.length > 0,
        attachmentCount: attachments.length,
      };

      await addDoc(collection(db, "tasks"), taskData);

      if (onTaskAdded) {
        onTaskAdded();
      }

      onClose();
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Create Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Task title"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-4 border-b border-gray-200 pb-2">
              <button type="button" className="text-gray-600 hover:text-gray-900">
                <Bold size={18} />
              </button>
              <button type="button" className="text-gray-600 hover:text-gray-900">
                <Strikethrough size={18} />
              </button>
              <button type="button" className="text-gray-600 hover:text-gray-900">
                <List size={18} />
              </button>
              <button type="button" className="text-gray-600 hover:text-gray-900">
                <AlignLeft size={18} />
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] placeholder-gray-400"
            />
            <div className="text-right text-gray-400 text-sm">
              {characterCount}/300 characters
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm text-gray-600 mb-1">Task Category*</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'Work' }))}
                  className={`px-4 py-2 rounded-full text-sm ${
                    formData.category === 'Work'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Work
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'Personal' }))}
                  className={`px-4 py-2 rounded-full text-sm ${
                    formData.category === 'Personal'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Personal
                </button>
              </div>
            </div>
            <div className="col-span-1">
  <label className="block text-sm text-gray-600 mb-1">Due on*</label>
  <input
    type="date"
    name="dueDate"
    value={formData.dueDate}
    onChange={handleInputChange}
    min={new Date().toISOString().split("T")[0]} // Ensures only future dates can be selected
    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
  {errors.dueDate && (
    <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
  )}
</div>


            <div className="col-span-1">
              <label className="block text-sm text-gray-600 mb-1">Task Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="TO-DO">Choose</option>
                <option value="TO-DO">To Do</option>
                <option value="IN-PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Attachment</label>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFilesDrop}
              className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center"
            >
              <p className="text-gray-500">Drop your files here or{' '}
                <label className="text-purple-600 cursor-pointer">
                  Update
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </p>
              {attachments.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {attachments.length} file(s) selected
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
              disabled={isSubmitting}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              CREATE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
