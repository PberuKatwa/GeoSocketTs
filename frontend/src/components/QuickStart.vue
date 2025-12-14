<template>
  <div class="quickstart-page">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text-group">
          <div class="hero-header">
            <i class="fas fa-map-marked-alt hero-icon"></i>
            <h1 class="hero-title">GeoSocketTs</h1>
          </div>
          <p class="hero-description">
            Real-time driver tracking and route simulation. Set markers, request routes, and simulate movements.
          </p>
        </div>
        
        <div class="hero-actions">
          <router-link to="/libre-map/demo" class="hero-button">
            Launch App <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="content-grid">
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

        <div class="content-area">
          
          <div v-if="activeSection === 'workflow'" class="content-card">
            <h2 class="section-title">
              <i class="fas fa-rocket"></i>
              Getting Started
            </h2>
            <div class="section-content">
              <p class="intro-text">
                Follow these steps to create your first route simulation in GeoSocketTs:
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
                  </div>
                </div>
              </div>

              <div class="cta-section">
                <router-link to="/libre-map/demo" class="cta-button">
                  <i class="fas fa-map-marked-alt"></i>
                  Try GeoSocketTs Now
                </router-link>
              </div>
            </div>
          </div>

          <div v-if="activeSection === 'overview'" class="content-card">
            <h2 class="section-title">
              <i class="fas fa-eye"></i>
              Overview
            </h2>
            <div class="section-content">
              <p class="intro-text">
                GeoSocketTs is a real-time driver tracking system that allows you to:
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

          <div v-if="activeSection === 'markers'" class="content-card">
            <h2 class="section-title">
              <i class="fas fa-map-pin"></i>
              Markers Guide
            </h2>
            <div class="section-content">
              <p class="intro-text">
                GeoSocketTs uses three types of markers to represent different locations and entities:
              </p>

              <div class="marker-cards">
                <div class="marker-card green">
                  <div class="marker-visual">
                    <div class="marker-pin green-marker"></div>
                  </div>
                  <div class="marker-info">
                    <h3 class="marker-title">Center Point (Green)</h3>
                    <p class="marker-description">
                      The starting point for your route. Represents the driver's starting location or depot.
                    </p>
                  </div>
                </div>

                <div class="marker-card red">
                  <div class="marker-visual">
                    <div class="marker-pin red-marker"></div>
                  </div>
                  <div class="marker-info">
                    <h3 class="marker-title">Target Point (Red)</h3>
                    <p class="marker-description">
                      The destination point for your route. Represents the delivery destination.
                    </p>
                  </div>
                </div>

                <div class="marker-card blue">
                  <div class="marker-visual">
                    <i class="fas fa-motorcycle driver-icon"></i>
                  </div>
                  <div class="marker-info">
                    <h3 class="marker-title">Driver (Blue Motorcycle)</h3>
                    <p class="marker-description">
                      The real-time position of the driver. Moves automatically during simulation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeSection === 'sidebar'" class="content-card">
            <h2 class="section-title">
              <i class="fas fa-sliders-h"></i>
              Sidebar Controls
            </h2>
            <div class="section-content">
              <div class="control-cards">
                <div class="control-card">
                  <div class="control-header">
                    <i class="fas fa-crosshairs control-icon"></i>
                    <h3 class="control-title">Add Center / Target</h3>
                  </div>
                  <p class="control-description">
                    Activates marker placement modes. Click the button, then click on the map.
                  </p>
                </div>

                <div class="control-card">
                  <div class="control-header">
                    <i class="fas fa-route control-icon"></i>
                    <h3 class="control-title">Request Route</h3>
                  </div>
                  <p class="control-description">
                    Calculates the optimal blue route line between your center and target points.
                  </p>
                </div>

                <div class="control-card">
                  <div class="control-header">
                    <i class="fas fa-play control-icon"></i>
                    <h3 class="control-title">Simulate</h3>
                  </div>
                  <p class="control-description">
                    Start or Stop the real-time driver movement along the calculated path.
                  </p>
                </div>
              </div>

              <div class="tip-box">
                <i class="fas fa-lightbulb"></i>
                <div>
                  <strong>Pro Tip:</strong> On mobile devices, use the hamburger menu (☰) to toggle the sidebar.
                </div>
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

// Set 'workflow' (Getting Started) as the default active section
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

/* --- REFACTORED COMPACT HERO SECTION --- */
.hero-section {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #3b82f6 100%);
  color: white;
  padding: 1.5rem 1.5rem; /* Drastically reduced padding */
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.2);
}

.hero-content {
  max-width: 90rem;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.hero-text-group {
  flex: 1;
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.hero-icon {
  font-size: 1.75rem;
  opacity: 0.9;
}

.hero-title {
  font-size: 2rem; /* Reduced from 3rem */
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.hero-description {
  font-size: 1rem; /* Reduced from 1.25rem */
  color: #e0e7ff;
  margin: 0;
  max-width: 600px;
}

.hero-actions {
  flex-shrink: 0;
}

.hero-button {
  background: white;
  color: #4f46e5;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.hero-button:hover {
  background: #f5f3ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Main Content */
.main-content {
  max-width: 90rem;
  margin: 0 auto;
  padding: 2rem 1.5rem; /* Reduced top padding */
}

.content-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
  align-items: start;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.nav-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.75rem;
  border: none;
  background: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.nav-item:hover {
  background: #f9fafb;
  color: #1f2937;
}

.nav-item.active {
  background: #eff6ff;
  color: #4f46e5;
  font-weight: 600;
}

/* Content Area */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  border: 1px solid #e5e7eb;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.section-title i {
  color: #4f46e5;
}

.section-content {
  color: #4b5563;
  line-height: 1.6;
}

.intro-text {
  font-size: 1.05rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

/* Feature List */
.feature-list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}

.feature-item {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.check-icon {
  color: #10b981;
  font-weight: 700;
}

/* Tech Stack */
.tech-stack {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.tech-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-badge {
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

/* Marker Cards & Control Cards */
.marker-cards, .control-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.marker-card, .control-card {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease;
}

.marker-card:hover, .control-card:hover {
  transform: translateY(-2px);
  border-color: #d1d5db;
}

/* Specific styling for markers visualization */
.marker-visual {
  height: 40px;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.marker-pin {
  width: 18px;
  height: 28px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  position: relative;
}

.marker-pin::after {
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

.green-marker { background: #22c55e; }
.red-marker { background: #ef4444; }
.driver-icon { font-size: 1.5rem; color: #3b82f6; }

.marker-title, .control-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.control-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.control-icon { color: #4f46e5; }
.marker-description, .control-description { font-size: 0.875rem; margin: 0; }

/* Workflow Steps */
.workflow-steps {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.workflow-step {
  display: flex;
  gap: 1.25rem;
}

.step-number {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 700;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.step-description {
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}

.step-tip {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  gap: 0.5rem;
}

.tip-box {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;
  color: #92400e;
  font-size: 0.9rem;
}

/* CTA Section */
.cta-section {
  margin-top: 2rem;
  text-align: center;
  border-top: 1px solid #f3f4f6;
  padding-top: 2rem;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: #4f46e5;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease;
}

.cta-button:hover {
  background: #4338ca;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  /* Stack Hero on smaller screens */
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .hero-actions {
    width: 100%;
  }
  
  .hero-button {
    width: 100%;
    justify-content: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .nav-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 1rem;
  }

  .nav-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}

@media (max-width: 600px) {
  .nav-list {
    grid-template-columns: 1fr;
  }
}
</style>