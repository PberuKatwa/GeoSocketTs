<template>
  <div class="quickstart-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-header">
          <i class="fas fa-map-marked-alt hero-icon"></i>
          <h1 class="hero-title">LibreMap Quick Start</h1>
        </div>
        <p class="hero-description">
          A powerful real-time driver tracking and route simulation system. 
          Set markers, request routes, and simulate driver movements with ease.
        </p>
        <div class="hero-actions">
          <router-link to="/libre-map/demo" class="hero-button">
            Launch App <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="content-grid">
        <!-- Navigation Sidebar -->
        <nav class="nav-sidebar">
          <div class="nav-card">
            <h3 class="nav-title">Contents</h3>
            <ul class="nav-list">
              <li v-for="section in sections" :key="section.id">
                <button
                  @click="activeSection = section.id"
                  :class="['nav-item', { active: activeSection === section.id }]"
                >
                  <i :class="section.icon"></i>
                  <span>{{ section.label }}</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Overview Section -->
          <div v-if="activeSection === 'overview'" class="content-card">
            <h2 class="section-title">
              <i class="fas fa-eye"></i>
              Overview
            </h2>
            <div class="section-content">
              <p class="intro-text">
                LibreMap is a real-time driver tracking system that allows you to:
              </p>
              <ul class="feature-list">
                <li class="feature-item">
                  <span class="check-icon">✓</span>
                  <span>Set custom center and target points on an interactive map</span>
                </li>
                <li class="feature-item">
                  <span class="check-icon">✓</span>
                  <span>Request optimized routes between locations using OSRM</span>
                </li>
                <li class="feature-item">
                  <span class="check-icon">✓</span>
                  <span>Simulate driver movements along calculated routes</span>
                </li>
                <li class="feature-item">
                  <span class="check-icon">✓</span>
                  <span>Track real-time driver positions with visual indicators</span>
                </li>
              </ul>

              <div class="tech-stack">
                <h3 class="subsection-title">Built With</h3>
                <div class="tech-badges">
                  <span class="tech-badge">Vue 3</span>
                  <span class="tech-badge">MapLibre GL</span>
                  <span class="tech-badge">WebSockets</span>
                  <span class="tech-badge">OSRM</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Markers Guide Section -->
          <div v-if="activeSection === 'markers'" class="content-card">
            <h2 class="section-title">
              <i class="fas fa-map-pin"></i>
              Markers Guide
            </h2>
            <div class="section-content">
              <p class="intro-text">
                LibreMap uses three types of markers to represent different locations and entities:
              </p>

              <div class="marker-cards">
                <!-- Center Marker -->
                <div class="marker-card green">
                  <div class="marker-visual">
                    <div class="marker-pin green-marker"></div>
                  </div>
                  <div class="marker-info">
                    <h3 class="marker-title">Center Point (Green)</h3>
                    <p class="marker-description">
                      The starting point for your route. This is where the driver begins their journey.
                      Click "Add Center" in the sidebar, then click anywhere on the map to place it.
                    </p>
                    <div class="marker-usage">
                      <strong>Usage:</strong> Represents the driver's starting location or depot.
                    </div>
                  </div>
                </div>

                <!-- Target Marker -->
                <div class="marker-card red">
                  <div class="marker-visual">
                    <div class="marker-pin red-marker"></div>
                  </div>
                  <div class="marker-info">
                    <h3 class="marker-title">Target Point (Red)</h3>
                    <p class="marker-description">
                      The destination point for your route. This is where the driver needs to reach.
                      Click "Add Target" in the sidebar, then click anywhere on the map to place it.
                    </p>
                    <div class="marker-usage">
                      <strong>Usage:</strong> Represents the delivery destination or endpoint.
                    </div>
                  </div>
                </div>

                <!-- Driver Marker -->
                <div class="marker-card blue">
                  <div class="marker-visual">
                    <i class="fas fa-motorcycle driver-icon"></i>
                  </div>
                  <div class="marker-info">
                    <h3 class="marker-title">Driver (Blue Motorcycle)</h3>
                    <p class="marker-description">
                      The real-time position of the driver during simulation. This moves automatically
                      along the calculated route when simulation is active.
                    </p>
                    <div class="marker-usage">
                      <strong>Usage:</strong> Shows current driver location and movement.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar Controls Section -->
          <div v-if="activeSection === 'sidebar'" class="content-card">
            <h2 class="section-title">
              <i class="fas fa-sliders-h"></i>
              Sidebar Controls
            </h2>
            <div class="section-content">
              <p class="intro-text">
                The sidebar provides all the controls you need to manage your map and simulations:
              </p>

              <div class="control-cards">
                <!-- Add Center -->
                <div class="control-card">
                  <div class="control-header">
                    <i class="fas fa-crosshairs control-icon"></i>
                    <h3 class="control-title">Add Center</h3>
                  </div>
                  <p class="control-description">
                    Activates center marker placement mode. Click anywhere on the map to set the green
                    starting point. The button will highlight while active.
                  </p>
                </div>

                <!-- Add Target -->
                <div class="control-card">
                  <div class="control-header">
                    <i class="fas fa-bullseye control-icon"></i>
                    <h3 class="control-title">Add Target</h3>
                  </div>
                  <p class="control-description">
                    Activates target marker placement mode. Click anywhere on the map to set the red
                    destination point. The button will highlight while active.
                  </p>
                </div>

                <!-- Request Route -->
                <div class="control-card">
                  <div class="control-header">
                    <i class="fas fa-route control-icon"></i>
                    <h3 class="control-title">Request Route</h3>
                  </div>
                  <p class="control-description">
                    Calculates and displays the optimal route between your center and target points.
                    The route appears as a blue line on the map. Both markers must be set first.
                  </p>
                </div>

                <!-- Start Simulation -->
                <div class="control-card">
                  <div class="control-header">
                    <i class="fas fa-play control-icon"></i>
                    <h3 class="control-title">Start Simulation</h3>
                  </div>
                  <p class="control-description">
                    Begins the driver simulation. The blue motorcycle icon will start moving from the
                    center point toward the target along the calculated route.
                  </p>
                </div>

                <!-- Stop Simulation -->
                <div class="control-card">
                  <div class="control-header">
                    <i class="fas fa-stop control-icon"></i>
                    <h3 class="control-title">Stop Simulation</h3>
                  </div>
                  <p class="control-description">
                    Pauses the current driver simulation. The driver will stop at their current position
                    and can be resumed by starting the simulation again.
                  </p>
                </div>
              </div>

              <div class="tip-box">
                <i class="fas fa-lightbulb"></i>
                <div>
                  <strong>Pro Tip:</strong> On mobile devices, use the hamburger menu (☰) in the top-left
                  corner to show/hide the sidebar and maximize your map viewing area.
                </div>
              </div>
            </div>
          </div>

          <!-- Getting Started Section -->
          <div v-if="activeSection === 'workflow'" class="content-card">
            <h2 class="section-title">
              <i class="fas fa-rocket"></i>
              Getting Started
            </h2>
            <div class="section-content">
              <p class="intro-text">
                Follow these steps to create your first route simulation:
              </p>

              <div class="workflow-steps">
                <div class="workflow-step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h3 class="step-title">Set Your Starting Point</h3>
                    <p class="step-description">
                      Click the <strong>"Add Center"</strong> button in the sidebar. The button will
                      turn green to indicate it's active. Now click anywhere on the map to place your
                      green center marker.
                    </p>
                    <div class="step-tip">
                      <i class="fas fa-info-circle"></i>
                      A toast notification will confirm your marker has been placed.
                    </div>
                  </div>
                </div>

                <div class="workflow-step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h3 class="step-title">Set Your Destination</h3>
                    <p class="step-description">
                      Click the <strong>"Add Target"</strong> button in the sidebar. Like before, the
                      button will highlight. Click on the map to place your red target marker at the
                      desired destination.
                    </p>
                    <div class="step-tip">
                      <i class="fas fa-info-circle"></i>
                      You can replace markers by clicking the button again and selecting a new location.
                    </div>
                  </div>
                </div>

                <div class="workflow-step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h3 class="step-title">Calculate the Route</h3>
                    <p class="step-description">
                      Click <strong>"Request Route"</strong> to calculate the optimal path between your
                      markers. A blue line will appear on the map showing the route the driver will follow.
                    </p>
                    <div class="step-tip">
                      <i class="fas fa-info-circle"></i>
                      The route uses real road data to find the most efficient path.
                    </div>
                  </div>
                </div>

                <div class="workflow-step">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <h3 class="step-title">Run the Simulation</h3>
                    <p class="step-description">
                      Click <strong>"Start Simulation"</strong> to begin. Watch the blue motorcycle icon
                      move along the route in real-time. You can stop the simulation at any time with
                      the "Stop Simulation" button.
                    </p>
                    <div class="step-tip">
                      <i class="fas fa-info-circle"></i>
                      The simulation runs continuously and can be restarted after stopping.
                    </div>
                  </div>
                </div>
              </div>

              <div class="success-box">
                <i class="fas fa-check-circle"></i>
                <div>
                  <strong>You're all set!</strong> You now know how to use LibreMap. Try experimenting
                  with different locations and watch how the routes change.
                </div>
              </div>

              <div class="cta-section">
                <h3 class="cta-title">Ready to Get Started?</h3>
                <router-link to="/libre-map/demo" class="cta-button">
                  <i class="fas fa-map-marked-alt"></i>
                  Open LibreMap
                </router-link>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeSection = ref('workflow');

const sections = [
  { id: 'workflow', label: 'Getting Started', icon: 'fas fa-rocket' },
  { id: 'overview', label: 'Overview', icon: 'fas fa-eye' },
  { id: 'markers', label: 'Markers Guide', icon: 'fas fa-map-pin' },
  { id: 'sidebar', label: 'Sidebar Controls', icon: 'fas fa-sliders-h' },
];
</script>

<style scoped>
/* Base Styles */
.quickstart-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #dbeafe 100%);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #3b82f6 100%);
  color: white;
  padding: 4rem 1.5rem;
}

.hero-content {
  max-width: 80rem;
  margin: 0 auto;
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.hero-icon {
  font-size: 2.5rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
}

.hero-description {
  font-size: 1.25rem;
  color: #ddd6fe;
  max-width: 48rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.hero-button {
  background: white;
  color: #4f46e5;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hero-button:hover {
  background: #ede9fe;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Main Content */
.main-content {
  max-width: 90rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

/* Navigation Sidebar */
.nav-sidebar {
  position: sticky;
  top: 1.5rem;
  height: fit-content;
}

.nav-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.nav-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.nav-item:hover {
  background: #f3f4f6;
}

.nav-item.active {
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 500;
}

/* Content Area */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title i {
  color: #4f46e5;
}

.section-content {
  color: #4b5563;
  line-height: 1.7;
}

.intro-text {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Feature List */
.feature-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
}

.feature-item {
  display: flex;
  align-items: start;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #374151;
}

.check-icon {
  color: #10b981;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* Tech Stack */
.tech-stack {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.subsection-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.tech-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tech-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Marker Cards */
.marker-cards {
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;
}

.marker-card {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.marker-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.marker-card.green {
  border-color: #22c55e;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.marker-card.red {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.marker-card.blue {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.marker-visual {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
}

.marker-pin {
  width: 24px;
  height: 36px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.marker-pin::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
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

.driver-icon {
  font-size: 2.5rem;
  color: #3b82f6;
}

.marker-info {
  flex: 1;
}

.marker-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.marker-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.marker-usage {
  background: rgba(255, 255, 255, 0.7);
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

/* Control Cards */
.control-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.control-card {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.control-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: #c7d2fe;
}

.control-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.control-icon {
  font-size: 1.5rem;
  color: #4f46e5;
}

.control-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.control-description {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

/* Tip Box */
.tip-box {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  align-items: start;
}

.tip-box i {
  color: #f59e0b;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tip-box strong {
  color: #92400e;
}

/* Workflow Steps */
.workflow-steps {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.workflow-step {
  display: flex;
  gap: 1.5rem;
}

.step-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.step-description {
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 1rem;
}

.step-tip {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  padding: 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #1e40af;
  display: flex;
  align-items: start;
  gap: 0.75rem;
}

.step-tip i {
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Success Box */
.success-box {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  align-items: start;
}

.success-box i {
  color: #059669;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.success-box strong {
  color: #065f46;
}

/* CTA Section */
.cta-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.cta-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .nav-sidebar {
    position: relative;
    top: 0;
  }

  .nav-card {
    margin-bottom: 1rem;
  }

  .nav-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .nav-item {
    margin-bottom: 0;
  }

  .control-cards {
    grid-template-columns: 1fr;
  }

  .marker-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .workflow-step {
    flex-direction: column;
  }

  .step-number {
    margin: 0 auto;
  }
}
</style>