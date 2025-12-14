<template>
  <div>
    <!-- Toggle Button -->
    <button 
      @click="toggleSidebar" 
      class="sidebar-toggle"
      :class="{ 'toggle-open': isOpen }"
      aria-label="Toggle sidebar"
    >
      <i :class="isOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
    </button>

    <!-- Sidebar -->
    <aside 
      class="action-sidebar" 
      :class="{ 'sidebar-open': isOpen, 'sidebar-closed': !isOpen }"
    >
      <div class="sidebar-header">
        <h3 class="sidebar-title">
          <i class="fas fa-map-marked-alt"></i>
          Map Controls
        </h3>
      </div>

      <!-- Mini Guide -->
      <div class="mini-guide">
        <h4 class="guide-title">
          <i class="fas fa-info-circle"></i>
          Marker Guide
        </h4>
        <div class="guide-item">
          <div class="marker-icon green-marker"></div>
          <span class="guide-text">Center Point (Green)</span>
        </div>
        <div class="guide-item">
          <div class="marker-icon red-marker"></div>
          <span class="guide-text">Target Point (Red)</span>
        </div>
        <div class="guide-item">
          <i class="fas fa-motorcycle guide-motorcycle"></i>
          <span class="guide-text">Driver (Blue Motorcycle)</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-list">
        <button
          v-for="action in actions"
          :key="action.label"
          @click="handleAction(action)"
          class="sidebar-button"
          :class="{ 'button-active': activeAction === action.label }"
        >
          <i v-if="action.icon" :class="action.icon" class="button-icon"></i>
          <span>{{ action.label }}</span>
        </button>
      </div>

      <slot></slot>
    </aside>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <div class="toast-content">
          <i :class="getToastIcon()" class="toast-icon"></i>
          <div class="toast-message">
            <strong>{{ toast.title }}</strong>
            <p>{{ toast.message }}</p>
          </div>
        </div>
        <button @click="closeToast" class="toast-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </Transition>

    <!-- Mobile Overlay -->
    <div 
      v-if="isOpen && isMobile" 
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { PropType } from 'vue';

export interface MapSide {
  label: string;
  handler: () => void | Promise<void>;
  icon?: string;
}

defineProps({
  actions: {
    type: Array as PropType<MapSide[]>,
    required: true,
  }
});

const emit = defineEmits<{
  markerSet: [type: 'center' | 'target'];
  simulationStopped: [];
}>();

const isOpen = ref(true);
const isMobile = ref(false);
const activeAction = ref<string | null>(null);
const toast = ref({
  show: false,
  title: '',
  message: '',
  type: 'info'
});

defineExpose({
  clearActiveState: () => {
    activeAction.value = null;
  }
});

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (isMobile.value) {
    isOpen.value = false;
  }
};

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

const closeSidebar = () => {
  if (isMobile.value) {
    isOpen.value = false;
  }
};

const handleAction = async (action: MapSide) => {
  const persistentActions = ['Add Center', 'Add Target', 'Start Simulation'];
  
  if (persistentActions.includes(action.label)) {
    activeAction.value = action.label;
  } else if (action.label === 'Stop Simulation') {
    activeAction.value = null;
  }

  showToast(action.label);

  try {
    await action.handler();
    
    if (action.label === 'Add Center' || action.label === 'Add Target') {
      setTimeout(() => {
        if (activeAction.value === action.label) {
          activeAction.value = null;
          showSuccessToast(action.label);
        }
      }, 100);
    }
  } catch (error) {
    console.error('Action error:', error);
    activeAction.value = null;
  }

  if (isMobile.value && action.label !== 'Add Center' && action.label !== 'Add Target') {
    setTimeout(() => closeSidebar(), 300);
  }
};

const showSuccessToast = (actionLabel: string) => {
  const successMessages: Record<string, { title: string; message: string }> = {
    'Add Center': {
      title: 'Center Point Set!',
      message: 'Green marker has been placed on the map ✓'
    },
    'Add Target': {
      title: 'Target Point Set!',
      message: 'Red marker has been placed on the map ✓'
    }
  };

  const config = successMessages[actionLabel];
  if (config) {
    toast.value = {
      show: true,
      title: config.title,
      message: config.message,
      type: 'success'
    };
  }
};

const showToast = (actionLabel: string) => {
  const toastMessages: Record<string, { title: string; message: string; type: string }> = {
    'Add Center': {
      title: 'Center Mode Active',
      message: 'Click anywhere on the map to place the green center marker',
      type: 'info'
    },
    'Add Target': {
      title: 'Target Mode Active',
      message: 'Click anywhere on the map to place the red target marker',
      type: 'info'
    },
    'Request Route': {
      title: 'Requesting Route...',
      message: 'Calculating the best route between markers',
      type: 'info'
    },
    'Start Simulation': {
      title: 'Simulation Started',
      message: 'Driver simulation is now running. Watch the blue motorcycle move!',
      type: 'success'
    },
    'Stop Simulation': {
      title: 'Simulation Stopped',
      message: 'Driver simulation has been paused',
      type: 'warning'
    }
  };

  const toastConfig = toastMessages[actionLabel] || {
    title: actionLabel,
    message: 'Action executed successfully',
    type: 'success'
  };

  toast.value = {
    show: true,
    ...toastConfig
  };
};

const closeToast = () => {
  toast.value.show = false;
};

const getToastIcon = () => {
  const icons: Record<string, string> = {
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    error: 'fas fa-times-circle'
  };
  return icons[toast.value.type] || icons.info;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.sidebar-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.2em;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.sidebar-toggle.toggle-open {
  left: 290px;
}

/* Sidebar */
.action-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 300px;
  padding: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-right: 1px solid #e0e0e0;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  transition: transform 0.3s ease;
  z-index: 1000;
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-closed {
  transform: translateX(-100%);
}

/* Sidebar Header */
.sidebar-header {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px;
}

.sidebar-title {
  font-size: 1.3em;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

/* Mini Guide */
.mini-guide {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #d0e0ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.guide-title {
  font-size: 0.95em;
  color: #4a5568;
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 0.9em;
}

.guide-item:last-child {
  margin-bottom: 0;
}

.marker-icon {
  width: 14px;
  height: 20px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  position: relative;
  flex-shrink: 0;
}

.marker-icon::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
}

.green-marker {
  background: #22c55e;
}

.red-marker {
  background: #ef4444;
}

.guide-motorcycle {
  font-size: 1.4em;
  color: #20395aff;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.guide-text {
  color: #4a5568;
  font-weight: 500;
  line-height: 1.4;
}

/* Action List */
.action-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-button {
  padding: 14px 16px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.sidebar-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-button:hover::before {
  opacity: 1;
}

.sidebar-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.sidebar-button:active {
  transform: translateY(0);
}

.sidebar-button.button-active {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border-color: #2f855a;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(72, 187, 120, 0.6);
  }
}

.button-icon {
  font-size: 1.1em;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 90px;
  right: 20px;
  min-width: 340px;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  z-index: 2000;
  border-left: 5px solid #667eea;
}

.toast-notification.info {
  border-left-color: #3b82f6;
}

.toast-notification.success {
  border-left-color: #10b981;
}

.toast-notification.warning {
  border-left-color: #f59e0b;
}

.toast-notification.error {
  border-left-color: #ef4444;
}

.toast-content {
  display: flex;
  gap: 12px;
  flex: 1;
}

.toast-icon {
  font-size: 1.6em;
  margin-top: 2px;
}

.toast-notification.info .toast-icon {
  color: #3b82f6;
}

.toast-notification.success .toast-icon {
  color: #10b981;
}

.toast-notification.warning .toast-icon {
  color: #f59e0b;
}

.toast-notification.error .toast-icon {
  color: #ef4444;
}

.toast-message {
  flex: 1;
}

.toast-message strong {
  display: block;
  color: #1f2937;
  margin-bottom: 6px;
  font-size: 1.05em;
}

.toast-message p {
  margin: 0;
  color: #6b7280;
  font-size: 0.92em;
  line-height: 1.5;
}

.toast-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  font-size: 1.1em;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #4b5563;
}

/* Toast Animation */
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-enter-from {
  transform: translateX(450px) scale(0.9);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(450px) scale(0.9);
  opacity: 0;
}

/* Mobile Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sidebar-toggle.toggle-open {
    left: 20px;
  }

  .action-sidebar {
    width: 85%;
    max-width: 320px;
  }

  .toast-notification {
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
    top: 80px;
  }
}

@media (max-width: 480px) {
  .sidebar-toggle {
    width: 42px;
    height: 42px;
    font-size: 1.1em;
  }

  .action-sidebar {
    width: 90%;
  }

  .sidebar-title {
    font-size: 1.15em;
  }

  .sidebar-button {
    padding: 12px 14px;
    font-size: 0.9em;
  }

  .mini-guide {
    padding: 12px;
  }

  .guide-item {
    font-size: 0.85em;
    gap: 10px;
  }
}

/* Scrollbar Styling */
.action-sidebar::-webkit-scrollbar {
  width: 6px;
}

.action-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.action-sidebar::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.action-sidebar::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>