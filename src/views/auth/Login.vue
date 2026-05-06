<template>
  <div class="login-page">
    <div class="background-overlay" aria-hidden="true"></div>
    <div class="auth-container">
      <!-- Botón Admin (esquina superior izquierda) -->
      <div v-if="currentView !== 'admin'" class="nav-buttons">
        <!-- Botón Admin -->
        <button @click="switchView('admin')" class="nav-btn admin-btn" title="Acceso Administrador">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Admin</span>
        </button>

        <!-- Botón Volver al Inicio -->
        <button @click="goHome" class="nav-btn home-btn" title="Volver al Inicio">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Inicio</span>
        </button>
      </div>
    

    <!-- Modal de Recuperación de Contraseña -->
    <div v-if="showForgotPasswordModal" class="modal-overlay" @click="closeForgotPasswordModal">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>{{ currentStep === 'email' ? 'Recuperar Contraseña' : currentStep === 'code' ? 'Verificar Código' : 'Nueva Contraseña' }}</h3>
          <button @click="closeForgotPasswordModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <!-- Paso 1: Verificar Email y Enviar Código -->
        <div v-if="currentStep === 'email'" class="modal-content">
          <div class="modal-info">
            <div class="info-icon">📧</div>
            <p>Ingresa tu email registrado. Verificaremos que exista en nuestro sistema y te enviaremos un código de recuperación.</p>
          </div>
          
          <form @submit.prevent="verifyEmailAndSendCode" class="modal-form">
            <div class="form-group">
              <label for="reset-email">Email Registrado:</label>
              <input
                type="email"
                id="reset-email"
                v-model="forgotPasswordData.email"
                placeholder="ejemplo@correo.com"
                required
                :disabled="isProcessing"
                autocomplete="email"
              />
            </div>
            
            <button type="submit" class="modal-btn primary" :disabled="isProcessing || !forgotPasswordData.email">
              <span v-if="isProcessing" class="spinner"></span>
              {{ isProcessing ? 'Verificando email...' : 'Verificar Email y Enviar Código' }}
            </button>
          </form>
        </div>

        <!-- Paso 2: Verificar Código -->
        <div v-if="currentStep === 'code'" class="modal-content">
          <div class="modal-info">
            <div class="info-icon">🔐</div>
            <p>Hemos enviado un código de 6 dígitos a <strong>{{ maskedEmail }}</strong></p>
            <p class="email-info">Revisa tu bandeja de entrada y carpeta de spam</p>
          </div>
          
          <form @submit.prevent="verifyResetCode" class="modal-form">
            <div class="form-group">
              <label for="verification-code">Código de Verificación:</label>
              <div class="code-input-container">
                <input
                  v-for="(digit, index) in verificationCode"
                  :key="index"
                  :ref="'codeInput' + index"
                  type="text"
                  maxlength="1"
                  v-model="verificationCode[index]"
                  @input="handleCodeInput(index, $event)"
                  @keydown="handleCodeKeydown(index, $event)"
                  @paste="handleCodePaste($event)"
                  class="code-digit"
                  :disabled="isProcessing"
                />
              </div>
            </div>

            <div class="code-timer">
              <span v-if="codeTimer > 0" class="timer-text">
                Código válido por {{ Math.floor(codeTimer / 60) }}:{{ (codeTimer % 60).toString().padStart(2, '0') }}
              </span>
              <button 
                v-else 
                type="button" 
                @click="resendCode" 
                class="resend-btn"
                :disabled="isProcessing"
              >
                Reenviar código
              </button>
            </div>
            
            <button type="submit" class="modal-btn primary" :disabled="isProcessing || !isCodeComplete">
              <span v-if="isProcessing" class="spinner"></span>
              {{ isProcessing ? 'Verificando...' : 'Verificar Código' }}
            </button>
          </form>
        </div>

        <!-- Paso 3: Nueva Contraseña -->
        <div v-if="currentStep === 'reset'" class="modal-content">
          <div class="modal-info">
            <div class="info-icon">🔑</div>
            <p>Crea una nueva contraseña segura para tu cuenta</p>
          </div>
          
          <form @submit.prevent="resetPassword" class="modal-form">
            <div class="form-group">
              <label for="new-password-reset">Nueva Contraseña:</label>
              <div class="password-input-container">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  id="new-password-reset"
                  v-model="forgotPasswordData.newPassword"
                  required
                  placeholder="Mínimo 8 caracteres"
                  :disabled="isProcessing"
                  minlength="8"
                  autocomplete="new-password"
                  @input="validateNewPassword"
                />
                <button 
                  type="button" 
                  @click="toggleNewPasswordVisibility" 
                  class="password-toggle-btn"
                  :disabled="isProcessing"
                >
                  <svg v-if="showNewPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 2 12 2 12C2.62125 10.6892 3.51445 9.50484 4.62 8.52M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 22 12 22 12C21.393 13.1356 20.6081 14.1992 19.68 15.15M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4283 14.7056 10.0887 14.481 9.80385 14.1962C9.51900 13.9113 9.29440 13.5717 9.14351 13.1984C8.99262 12.8251 8.91851 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 3L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <!-- Indicador de fortaleza -->
              <div v-if="forgotPasswordData.newPassword" class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrengthWidth + '%' }"
                  ></div>
                </div>
                <span class="strength-text" :class="passwordStrengthClass">
                  {{ passwordStrengthText }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label for="confirm-password-reset">Confirmar Nueva Contraseña:</label>
              <div class="password-input-container">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirm-password-reset"
                  v-model="forgotPasswordData.confirmPassword"
                  required
                  placeholder="Repite tu nueva contraseña"
                  :disabled="isProcessing"
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  @click="toggleConfirmPasswordVisibility" 
                  class="password-toggle-btn"
                  :disabled="isProcessing"
                >
                  <svg v-if="showConfirmPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 2 12 2 12C2.62125 10.6892 3.51445 9.50484 4.62 8.52M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 22 12 22 12C21.393 13.1356 20.6081 14.1992 19.68 15.15M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4283 14.7056 10.0887 14.481 9.80385 14.1962C9.51900 13.9113 9.29440 13.5717 9.14351 13.1984C8.99262 12.8251 8.91851 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 3L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <!-- Indicador de coincidencia -->
              <div v-if="forgotPasswordData.confirmPassword" class="password-match">
                <span v-if="passwordsMatch" class="match-success">✓ Las contraseñas coinciden</span>
                <span v-else class="match-error">✗ Las contraseñas no coinciden</span>
              </div>
            </div>
            
            <button type="submit" class="modal-btn primary" :disabled="isProcessing || !isResetFormValid">
              <span v-if="isProcessing" class="spinner"></span>
              {{ isProcessing ? 'Actualizando...' : 'Restablecer Contraseña' }}
            </button>
          </form>
        </div>

        <!-- Mensajes del modal -->
        <div v-if="modalError" class="message error-message">
          <i class="message-icon">⚠</i>
          {{ modalError }}
        </div>

        <div v-if="modalSuccess" class="message success-message">
          <i class="message-icon">✅</i>
          {{ modalSuccess }}
        </div>
      </div>
    </div>

    <!-- Suspended Account Modal -->
    <div v-if="showSuspendedAccountModal" class="modal-overlay" @click="closeSuspendedAccountModal">
      <div class="modal-card suspended-modal" @click.stop>
        <div class="modal-header suspended-header">
          <div class="suspended-icon-container">
            <div class="suspended-icon">🔒</div>
          </div>
          <h3>Cuenta Suspendida</h3>
          <button @click="closeSuspendedAccountModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div class="modal-content suspended-content">
          <div class="suspended-warning">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
              <h4>Acceso Denegado por Razones de Seguridad</h4>
              <p>Tu cuenta ha sido suspendida temporalmente por medidas de seguridad.</p>
              <p class="reason-text">Esto puede deberse a:</p>
              <ul class="reason-list">
                <li>Actividad sospechosa detectada</li>
                <li>Violación de los términos de servicio</li>
                <li>Medidas de seguridad preventivas</li>
              </ul>
            </div>
          </div>

          <div class="suspended-actions">
            <div class="action-info">
              <p><strong>¿Qué hacer ahora?</strong></p>
              <p>Contacta al administrador del sistema para reactivar tu cuenta.</p>
              <div class="contact-info">
                <span class="contact-label">📧 Email de soporte:</span>
                <span class="contact-value">admin@brindisexpress.com</span>
              </div>
            </div>
            
            <div class="modal-actions">
              <button @click="closeSuspendedAccountModal" class="modal-btn primary">
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Google Login Suspended Modal -->
    <div v-if="showGoogleLoginSuspendedModal" class="modal-overlay" @click="closeGoogleLoginSuspendedModal">
      <div class="modal-card" style="max-width: 500px; background: linear-gradient(145deg, rgba(40,40,40,0.95), rgba(30,30,30,0.95)); border: 2px solid rgba(234, 67, 53, 0.3);" @click.stop>
        <div class="modal-header" style="background: linear-gradient(135deg, rgba(234, 67, 53, 0.1), rgba(219, 68, 55, 0.05)); border-bottom: 1px solid rgba(234, 67, 53, 0.3); padding: 1.5rem; display: flex; align-items: center; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: linear-gradient(135deg, rgba(234, 67, 53, 0.2), rgba(219, 68, 55, 0.1)); border-radius: 50%; border: 2px solid rgba(234, 67, 53, 0.4);">
            <span style="font-size: 2rem;">🚫</span>
          </div>
          <h3 style="margin: 0; color: #ea4335; font-size: 1.5rem; font-weight: 700;">Cuenta Suspendida</h3>
          <button @click="closeGoogleLoginSuspendedModal" class="close-btn" style="margin-left: auto;">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div class="modal-content" style="padding: 2rem; color: #ffffff;">
          <div style="background: rgba(234, 67, 53, 0.05); border: 1px solid rgba(234, 67, 53, 0.2); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; display: flex; gap: 1rem; align-items: flex-start;">
            <span style="font-size: 2rem; flex-shrink: 0;">🔒</span>
            <div>
              <h4 style="color: #ea4335; margin: 0 0 0.5rem 0; font-size: 1.2rem; font-weight: 600;">Cuenta suspendida por razones de seguridad</h4>
              <p style="color: rgba(255, 255, 255, 0.8); margin: 0.5rem 0; line-height: 1.5;">Tu cuenta de Google ha sido suspendida temporalmente debido a medidas de seguridad.</p>
              <p style="font-weight: 600; color: rgba(255, 255, 255, 0.9); margin-top: 1rem;">Esto puede deberse a:</p>
              <ul style="margin: 0.5rem 0 0 1.5rem; color: rgba(255, 255, 255, 0.7);">
                <li style="margin: 0.3rem 0;">Cuenta no aprobada para inicio de sesión con Google</li>
                <li style="margin: 0.3rem 0;">Violación de las políticas de seguridad</li>
                <li style="margin: 0.3rem 0;">Suspensión administrativa</li>
              </ul>
            </div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.02); border-radius: 12px; padding: 1.5rem;">
            <div>
              <p style="color: rgba(255, 255, 255, 0.8); margin: 0.5rem 0; line-height: 1.5;"><strong>¿Qué hacer ahora?</strong></p>
              <p style="color: rgba(255, 255, 255, 0.8); margin: 0.5rem 0; line-height: 1.5;">Contacta con el administrador del sistema para solicitar acceso al inicio de sesión con Google.</p>
              <div style="background: rgba(66, 133, 244, 0.1); border: 1px solid rgba(66, 133, 244, 0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem;">
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">📧 Soporte Administrativo:</span>
                <span style="color: #4285f4; font-weight: 600; font-family: 'Courier New', monospace;">admin@brindisexpress.com</span>
              </div>
            </div>
            
            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
              <button @click="closeGoogleLoginSuspendedModal" class="modal-btn" style="background: linear-gradient(135deg, rgba(234, 67, 53, 0.2), rgba(219, 68, 55, 0.1)); border: 1px solid rgba(234, 67, 53, 0.4); color: #ea4335; padding: 0.8rem 2rem; font-weight: 600; border-radius: 25px; cursor: pointer;">
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="auth-grid">
      <!-- Sección de Marca (Lado Izquierdo) -->
      <div class="auth-brand-section">
        <div class="brand-content-wrapper">
          <div class="brand-badge">Sabor & Excelencia</div>
          <h1 class="brand-main-title">EL ARTE DEL <br/><span class="highlight-gold">BUEN VIVIR</span></h1>
          <p class="brand-subtitle">
            Un refugio para los amantes de la alta cocina y la coctelería de autor. 
            Regístrate para vivir una experiencia gastronómica sin precedentes.
          </p>
          
          <div class="brand-stats">
            <div class="stat-box">
              <span class="stat-number">25+</span>
              <span class="stat-label">Años de Tradición</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">12</span>
              <span class="stat-label">Chef's Estrellas</span>
            </div>
          </div>
          
          <div class="brand-decorative-line"></div>
        </div>
      </div>

      <div class="auth-grid-left">
        <div class="auth-left-stage">
          <!-- Componente de Login Principal -->
          <div v-if="currentView !== 'admin'" class="auth-card">
            <div class="auth-tabs">
              <button 
                class="tab-btn" 
                :class="{ active: currentView === 'login' }"
                @click="switchView('login')"
              >
                Iniciar Sesión
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: currentView === 'register' }"
                @click="switchView('register')"
              >
                Registrarse
              </button>
            </div>

            <!-- Vista de Login -->
            <div v-if="currentView === 'login'" class="auth-view">
              <div class="auth-header">
                <h2>Iniciar Sesión</h2>
                <p>Bienvenido de vuelta</p>
              </div>
              
              <form @submit.prevent="handleLogin" class="auth-form">
                <div class="form-group">
                  <label for="login-email">Email:</label>
                  <input
                    type="email"
                    id="login-email"
                    v-model="loginData.email"
                    required
                    placeholder="ejemplo@correo.com"
                    :disabled="isLoading"
                  />
                </div>
                
                <div class="form-group">
                  <label for="login-password">Contraseña:</label>
                  <input
                    type="password"
                    id="login-password"
                    v-model="loginData.password"
                    required
                    placeholder="Tu contraseña"
                    :disabled="isLoading"
                  />
                </div>
                
                <div class="form-options">
                  <label class="checkbox-container">
                    <input type="checkbox" v-model="rememberMe">
                    <span class="checkmark"></span>
                    Recordarme
                  </label>
                  <button 
                    type="button" 
                    @click="openForgotPasswordModal" 
                    class="forgot-password-btn"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <button type="submit" class="auth-btn" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                </button>
                <div class="google-divider">
                  <span class="google-divider-line" />
                  <span class="google-divider-text">o continúa con</span>
                  <span class="google-divider-line" />
                </div>
                <!-- Google Sign-In Button Container -->
                <div id="googleBtn" class="google-login"></div>
              </form>
            </div>

            <!-- Vista de Registro -->
            <div v-if="currentView === 'register'" class="auth-view">
              <div class="auth-header">
                <h2>Crear Cuenta</h2>
                <p>Únete a nuestra plataforma</p>
              </div>
              
              <form @submit.prevent="handleRegister" class="auth-form">
                <div class="form-group">
                  <label for="register-nombre">Nombre completo:</label>
                  <input
                    type="text"
                    id="register-nombre"
                    v-model="registerData.nombre"
                    required
                    placeholder="Tu nombre completo"
                    :disabled="isLoading"
                  />
                </div>
                <div class="form-group">
                  <label for="register-email">Email:</label>
                  <input
                    type="email"
                    id="register-email"
                    v-model="registerData.email"
                    required
                    placeholder="ejemplo@correo.com"
                    :disabled="isLoading"
                  />
                </div>
                
                <div class="form-group">
                  <label for="register-password">Contraseña:</label>
                  <input
                    type="password"
                    id="register-password"
                    v-model="registerData.password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    :disabled="isLoading"
                    minlength="6"
                  />
                </div>
                <div class="form-group">
                  <label for="register-confirm-password">Confirmar Contraseña:</label>
                  <input
                    type="password"
                    id="register-confirm-password"
                    v-model="registerData.confirmPassword"
                    required
                    placeholder="Repite tu contraseña"
                    :disabled="isLoading"
                  />
                </div>
                
                <div class="form-options">
                  <label class="checkbox-container">
                    <input type="checkbox" v-model="acceptTerms" required>
                    <span class="checkmark"></span>
                    Acepto los <a href="#" class="terms-link">términos y condiciones</a>
                  </label>
                </div>
                
                <button type="submit" class="auth-btn" :disabled="isLoading || !acceptTerms">
                  <span v-if="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
                </button>
              </form>
            </div>
          
            <!-- Mensajes de error y éxito -->
            <div v-if="error" class="message error-message">
              <i class="message-icon">⚠</i>
              {{ error }}
            </div>

            <div v-if="successMessage" class="message success-message">
              <i class="message-icon">✅</i>
              {{ successMessage }}
            </div>
          </div>

          <!-- PANEL ADMIN (se abre con botón Admin) -->
          <div v-if="currentView === 'admin'" class="auth-card admin-card">
          <!-- Botón para volver al login normal -->
          <button @click="backToUserLogin" class="back-to-login-btn" title="Volver al login de usuarios">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Volver al Login</span>
          </button>

      <!-- Icono de candado animado -->
      <div class="admin-lock-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="admin-lock-svg">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      <div class="auth-view admin-auth-view">
        <div class="auth-header admin-header">
          <h2>PANEL DE<br/>ADMINISTRACIÓN</h2>
          <p>Inicia sesión como administrador</p>
        </div>
        
        <form @submit.prevent="handleAdminLogin" class="auth-form admin-form">
          <div class="form-group admin-form-group">
            <label for="admin-email">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              CORREO ADMINISTRATIVO:
            </label>
            <input
              type="email"
              id="admin-email"
              v-model="adminLoginData.email"
              required
              placeholder="admin@brazzino.com"
              :disabled="isLoading"
              class="admin-input"
            />
          </div>
          
          <div class="form-group admin-form-group">
            <label for="admin-password">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              CONTRASEÑA:
            </label>
            <div class="admin-password-wrapper">
              <input
                :type="showAdminPassword ? 'text' : 'password'"
                id="admin-password"
                v-model="adminLoginData.password"
                required
                placeholder="Contraseña de administrador"
                :disabled="isLoading"
                class="admin-input"
              />
              <button 
                type="button" 
                @click="toggleAdminPasswordVisibility" 
                class="admin-password-toggle"
                :disabled="isLoading"
              >
                <svg v-if="showAdminPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 2 12 2 12C2.62125 10.6892 3.51445 9.50484 4.62 8.52M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 22 12 22 12C21.393 13.1356 20.6081 14.1992 19.68 15.15M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4283 14.7056 10.0887 14.481 9.80385 14.1962C9.51900 13.9113 9.29440 13.5717 9.14351 13.1984C8.99262 12.8251 8.91851 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M3 3L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="form-options admin-options">
            <label class="admin-checkbox-container">
              <input type="checkbox" v-model="rememberMe">
              <span class="admin-checkmark"></span>
              Mantener sesión iniciada
            </label>
          </div>
          
          <button 
            type="submit" 
            class="auth-btn admin-btn" 
            :disabled="isLoading"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Iniciando sesión...' : 'INICIAR SESIÓN' }}
          </button>
        </form>
      </div>

      <!-- Mensajes de error y éxito del admin -->
      <div v-if="error" class="message error-message">
        <i class="message-icon">⚠</i>
        {{ error }}
      </div>

      <div v-if="successMessage" class="message success-message">
        <i class="message-icon">✅</i>
        {{ successMessage }}
      </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AuthComponent",
  data() {
    return {
      currentView: "login",
      isLoading: false,
      error: null,
      successMessage: null,
      loginData: {
        email: "",
        password: ""
      },
      rememberMe: true,
      registerData: {
        nombre: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      },
      acceptTerms: false,
      adminLoginData: {
        email: "",
        password: ""
      },
      showAdminPassword: false,
      showForgotPasswordModal: false,
      showSuspendedAccountModal: false,
      showGoogleLoginSuspendedModal: false,
      currentStep: "email",
      isProcessing: false,
      modalError: "",
      modalSuccess: "",
      forgotPasswordData: {
        email: "",
        newPassword: "",
        confirmPassword: ""
      },
      verificationCode: ["", "", "", "", "", ""],
      codeTimer: 0,
      timerInterval: null,
      passwordStrength: 0,
      showNewPassword: false,
      showConfirmPassword: false
    };
  },

  computed: {
    maskedEmail() {
      if (!this.forgotPasswordData.email) return "";
      const [username, domain] = this.forgotPasswordData.email.split("@");
      const maskedUsername =
        username.substring(0, 2) + "*".repeat(Math.max(0, username.length - 2));
      return `${maskedUsername}@${domain}`;
    },

    isCodeComplete() {
      return this.verificationCode.every(digit => digit !== "");
    },

    passwordsMatch() {
      return (
        this.forgotPasswordData.newPassword ===
        this.forgotPasswordData.confirmPassword
      );
    },

    passwordStrengthClass() {
      if (this.passwordStrength <= 1) return "weak";
      if (this.passwordStrength <= 2) return "fair";
      if (this.passwordStrength <= 3) return "good";
      return "strong";
    },

    passwordStrengthWidth() {
      return (this.passwordStrength / 4) * 100;
    },

    passwordStrengthText() {
      const texts = ["Muy Débil", "Débil", "Regular", "Buena", "Muy Fuerte"];
      return texts[this.passwordStrength] || "Muy Débil";
    },

    isResetFormValid() {
      return (
        this.forgotPasswordData.newPassword &&
        this.forgotPasswordData.confirmPassword &&
        this.passwordsMatch &&
        this.passwordStrength >= 3
      );
    }
  },

  mounted() {
    console.log("🔍 Login component mounted - v2");
    if (this.currentView === 'login') {
      this.initGoogleLogin();
    }
  },

  watch: {
    currentView(newView) {
      if (newView === 'login') {
        this.$nextTick(() => {
          this.initGoogleLogin();
        });
      }
    }
  },

  methods: {

    // Limpia mensajes para que el flujo de login/registros no se rompa.
    clearMessages() {
      this.error = null;
      this.successMessage = null;
      this.modalError = "";
      this.modalSuccess = "";
    },

    // Suspended Account Modal Methods
    openSuspendedAccountModal() {
      console.log('🔴 openSuspendedAccountModal CALLED - tracking stack trace');
      console.trace(); // This will show what called this method
      this.showSuspendedAccountModal = true;
      this.clearMessages();
    },

    closeSuspendedAccountModal() {
      this.showSuspendedAccountModal = false;
    },

    // Google Login Suspended Modal Methods
    openGoogleLoginSuspendedModal() {
      console.log('🔍 openGoogleLoginSuspendedModal called');
      this.showGoogleLoginSuspendedModal = true;
      console.log('🔍 Modal state set to true:', this.showGoogleLoginSuspendedModal);
      this.clearMessages();
      
      // Force Vue reactivity
      this.$forceUpdate();
      console.log('🔍 Force update completed');
    },

    closeGoogleLoginSuspendedModal() {
      console.log('🔍 closeGoogleLoginSuspendedModal called');
      this.showGoogleLoginSuspendedModal = false;
    },


    // Cambia la vista del componente (login/register/admin) desde el template.
    switchView(view) {
      this.currentView = view;
      this.error = null;
      this.successMessage = null;
    },

    backToUserLogin() {
      this.switchView("login");
    },

    goHome() {
      this.$router.push("/home");
    },



    async handleLogin() {
      this.isLoading = true;
      this.clearMessages();
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/login`,
          {
            email: this.loginData.email.trim().toLowerCase(),
            password: this.loginData.password
          }
        );
        const token = data.access_token || data.token || data.accessToken;
        const usuario = data.usuario || data.user;
        if (!token) throw new Error("Respuesta inválida del servidor");
        
        console.log('🔍 Regular Login Response:', {
          token: token ? 'present' : 'missing',
          usuario: usuario,
          activo: usuario?.activo,
          userFields: Object.keys(usuario || {})
        });
        
        // Additional validation: Check user status against admin endpoint
      try {
        const adminResponse = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (adminResponse.ok) {
          const adminUsers = await adminResponse.json();
          const currentUser = adminUsers.find(u => u.email === usuario.email);
          
          console.log('🔍 Admin validation for regular login:', {
            userEmail: usuario.email,
            currentUser: currentUser,
            isActive: currentUser?.activo
          });
          
          // Check if user exists and is active in admin system
          if (!currentUser) {
            console.log('🚫 Regular login blocked - user not found in admin system');
            this.error = 'Usuario no encontrado en el sistema. Contacta al administrador.';
            return;
          }
          
          if (currentUser.activo === false || currentUser.activo === 0) {
            console.log('🚫 Regular login blocked - user is inactive in admin system');
            this.openSuspendedAccountModal();
            return;
          }
          
          // Update user data with admin system status
          usuario.activo = currentUser.activo;
          
        } else {
          console.log('⚠️ Could not validate against admin endpoint, proceeding with caution');
        }
      } catch (adminError) {
        console.log('⚠️ Admin validation failed, using original response:', adminError.message);
      }
      
      // Final status check
      if (usuario.activo === false || usuario.activo === 0) {
        console.log('🚫 Regular login blocked - user is inactive after validation');
        this.openSuspendedAccountModal();
        return;
      }
      
      console.log('✅ Regular login validated - user is active');
        
        localStorage.setItem("authToken", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));
        this.successMessage = `¡Bienvenido, ${usuario?.nombre || usuario?.email || "Usuario"}!`;
        setTimeout(() => this.$router.push("/home"), 1000);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Error al iniciar sesión.";
        const statusCode = err.response?.status;
        
        // STRICTEST CHECK: Only show suspended modal when:
        // 1. Backend responds with 401 or 403 status (unauthorized/forbidden)
        // 2. Backend has a message field
        // 3. Message contains suspension keywords
        const isUnauthorizedStatus = statusCode === 401 || statusCode === 403;
        const hasSuspensionKeywords = errorMsg.toLowerCase().includes('inactivo') || 
                                      errorMsg.toLowerCase().includes('suspendido') ||
                                      errorMsg.toLowerCase().includes('desactivado') ||
                                      errorMsg.toLowerCase().includes('usuario suspendido') ||
                                      errorMsg.toLowerCase().includes('cuenta suspendida');
        
        // Must come from our backend API with proper error structure
        const isBackendError = err.response?.data && 
                               typeof err.response.data === 'object' &&
                               err.response.data.message !== undefined;
        
        // Only show suspended modal if ALL conditions are met
        const isUserInactive = isUnauthorizedStatus && isBackendError && hasSuspensionKeywords;
        
        console.log('Login error analysis:', {
          errorMsg,
          statusCode,
          isUnauthorizedStatus,
          isBackendError,
          hasSuspensionKeywords,
          isUserInactive
        });
        
        if (isUserInactive) {
          console.log('🚫 Regular login blocked - user is inactive/suspended');
          this.openSuspendedAccountModal();
        } else {
          // Show generic error for other failures (wrong password, server errors, etc.)
          console.log('⚠️ Login error (not suspended):', errorMsg);
          this.error = errorMsg;
        }
      } finally {
        this.isLoading = false;
      }
    },

    async resendCode() {
      this.isProcessing = true;
      this.modalError = "";
      this.modalSuccess = "";
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password/send`, {
          email: this.forgotPasswordData.email.trim().toLowerCase()
        });
        this.modalSuccess = "Código reenviado.";
        this.codeTimer = 600;
        this.startTimer();
      } catch (error) {
        this.modalError = error.response?.data?.message || "Error al reenviar el código.";
      } finally {
        this.isProcessing = false;
      }
    },

    handleCodePaste(event) {
      event.preventDefault();
      const text = (event.clipboardData || window.clipboardData).getData("text") || "";
      const digits = text.replace(/\D/g, "").slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        this.verificationCode[i] = digits[i] || "";
      }
      this.$nextTick(() => {
        const idx = Math.min(Math.max(digits.length - 1, 0), 5);
        const ref = this.$refs[`codeInput${idx}`];
        if (ref && ref[0]) ref[0].focus();
      });
    },

    // REAL GOOGLE OAUTH LOGIN
    async loadGoogleSDK() {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
          console.log('✅ Google SDK already loaded');
          resolve();
          return;
        }

        console.log('🔍 Loading Google Identity Services SDK...');
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('✅ Google SDK loaded successfully');
          resolve();
        };
        
        script.onerror = () => {
          console.error('❌ Failed to load Google SDK');
          reject(new Error('Failed to load Google SDK'));
        };
        
        document.head.appendChild(script);
      });
    },

    async initGoogleLogin() {
      console.log('🔍 Initializing Google Login...');
      
      try {
        await this.loadGoogleSDK();
        
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        console.log('🔍 Google Client ID:', clientId ? 'Present' : 'Missing');
        
        if (!clientId) {
          console.error('❌ Google Client ID not configured');
          this.error = 'Google login not configured. Please contact admin.';
          return;
        }

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: this.handleGoogleLoginResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin'
        });

        // Render the Google button
        const googleBtnContainer = document.getElementById('googleBtn');
        if (googleBtnContainer) {
          console.log('✅ Rendering Google button');
          window.google.accounts.id.renderButton(googleBtnContainer, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            width: 280,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        } else {
          console.error('❌ Google button container not found');
        }

        // Also enable One Tap (optional)
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('🔍 One Tap not displayed:', notification.getNotDisplayedReason());
          }
        });

      } catch (error) {
        console.error('❌ Google login initialization failed:', error);
        this.error = 'Error initializing Google login. Please try again.';
      }
    },

    async handleGoogleLoginResponse(response) {
      console.log('🔍 Google login response received');
      
      try {
        this.isLoading = true;
        this.clearMessages();

        if (!response.credential) {
          throw new Error('No credential received from Google');
        }

        // Decode JWT to get user info
        const jwtPayload = JSON.parse(atob(response.credential.split('.')[1]));
        console.log('✅ Google user info:', {
          email: jwtPayload.email,
          name: jwtPayload.name,
          picture: jwtPayload.picture
        });

        // Call backend to verify and create session
        const apiResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/google/login`,
          {
            token: response.credential
          }
        );

        const { access_token, usuario } = apiResponse.data;

        // Check if user is active
        if (usuario.activo === false || usuario.activo === 0) {
          console.log('🚫 Google login blocked - user is inactive');
          this.openSuspendedAccountModal();
          return;
        }

        // Store session
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('googleLogin', 'true');

        console.log('✅ Google login successful - user:', usuario.nombre);
        this.successMessage = `¡Bienvenido, ${usuario.nombre || usuario.email}!`;

        // Redirect to home
        setTimeout(() => {
          this.$router.push('/home');
        }, 1000);

      } catch (error) {
        console.error('❌ Google login error:', error);
        
        const errorMsg = error.response?.data?.message || error.message || '';
        const statusCode = error.response?.status;
        
        // STRICTEST CHECK: Only show suspended modal when:
        // 1. Backend responds with 401 or 403 status (unauthorized/forbidden)
        // 2. Backend has a message field
        // 3. Message contains suspension keywords
        // This prevents Google SDK errors (403 from Google SDK) from triggering the modal
        const isUnauthorizedStatus = statusCode === 401 || statusCode === 403;
        const hasSuspensionKeywords = errorMsg.toLowerCase().includes('suspendido') || 
                                      errorMsg.toLowerCase().includes('inactivo') ||
                                      errorMsg.toLowerCase().includes('desactivado') ||
                                      errorMsg.toLowerCase().includes('usuario suspendido') ||
                                      errorMsg.toLowerCase().includes('cuenta suspendida');
        
        // Must come from our backend API with proper structure
        const isBackendError = error.response?.data && 
                               typeof error.response.data === 'object' &&
                               error.response.data.message !== undefined;
        
        // Only show suspended modal if ALL conditions are met
        const isUserSuspended = isUnauthorizedStatus && isBackendError && hasSuspensionKeywords;
        
        console.log('Error analysis:', {
          errorMsg,
          statusCode,
          isUnauthorizedStatus,
          isBackendError,
          hasSuspensionKeywords,
          isUserSuspended
        });
        
        if (isUserSuspended) {
          console.log('🚫 Google login blocked - user is suspended');
          this.openSuspendedAccountModal();
        } else {
          // Show generic error for Google SDK errors, network issues, etc.
          console.log('⚠️ Google login error (not suspended):', errorMsg);
          // NEVER show suspended modal for non-backend errors
          // Don't show technical error messages to user
          if (errorMsg.includes('origin is not allowed') || errorMsg.includes('not allowed for the given client') || (statusCode === 403 && !isBackendError)) {
            console.log('🔧 Google OAuth config error - not showing suspended modal');
            this.error = 'Error de configuración de Google Login. Verifica el dominio en Google Cloud Console.';
          } else if (!isBackendError) {
            // Any non-backend error should never trigger suspended modal
            console.log('🔧 Non-backend error - not showing suspended modal');
            this.error = 'Error al iniciar sesión con Google. Intenta de nuevo.';
          } else {
            this.error = errorMsg || 'Error al iniciar sesión con Google.';
          }
        }
      } finally {
        this.isLoading = false;
      }
    },

    // --- MANEJO DE REGISTRO ---
    async handleRegister() {
      this.isLoading = true;
      this.clearMessages();

      try {
        if (!this.registerData.nombre || !this.registerData.email || !this.registerData.password) {
          throw new Error("Por favor completa todos los campos obligatorios");
        }
        if (this.registerData.password !== this.registerData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }

        const registerPayload = {
          email: this.registerData.email.trim().toLowerCase(),
          nombre: this.registerData.nombre.trim(),
          password: this.registerData.password,
          role: this.registerData.role 
        };

        await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, registerPayload);
        this.successMessage = "¡Cuenta creada con éxito!";
        
        setTimeout(() => {
          this.switchView("login");
        }, 2000);
      } catch (err) {
        this.error = err.response?.data?.message || "Error en el registro.";
      } finally {
        this.isLoading = false;
      }
    },

    // --- MANEJO DE ADMIN LOGIN ---
    async handleAdminLogin() {
      this.isLoading = true;
      this.clearMessages();
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/admin-login`,
          {
            email: this.adminLoginData.email.trim().toLowerCase(),
            password: this.adminLoginData.password
          }
        );
        const { access_token, usuario } = response.data;
        if (usuario.role !== 'admin') throw new Error("Acceso denegado.");

        localStorage.setItem("adminToken", access_token);
        localStorage.setItem("adminUser", JSON.stringify(usuario));
        this.successMessage = `¡Bienvenido, administrador!`;
        setTimeout(() => { this.$router.push("/admin"); }, 1000);
      } catch (err) {
        this.error = err.response?.data?.message || "Error de acceso admin.";
      } finally {
        this.isLoading = false;
      }
    },

    // --- RECUPERACIÓN DE CONTRASEÑA ---
    openForgotPasswordModal() {
      this.showForgotPasswordModal = true;
      this.currentStep = "email";
      this.resetForgotPasswordData();
    },
    
    closeForgotPasswordModal() {
      this.showForgotPasswordModal = false;
      this.stopTimer();
    },

    resetForgotPasswordData() {
      this.forgotPasswordData = { email: "", newPassword: "", confirmPassword: "" };
      this.verificationCode = ["", "", "", "", "", ""];
      this.passwordStrength = 0;
    },

    async verifyEmailAndSendCode() {
      this.isProcessing = true;
      this.modalError = "";
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password/send`, {
          email: this.forgotPasswordData.email.trim().toLowerCase()
        });
        this.modalSuccess = "Código enviado.";
        this.codeTimer = 600;
        this.startTimer();
        setTimeout(() => { this.currentStep = "code"; this.modalSuccess = ""; }, 2000);
      } catch (error) {
        this.modalError = error.response?.data?.message || "Error al enviar código.";
      } finally { this.isProcessing = false; }
    },

    async verifyResetCode() {
      this.isProcessing = true;
      try {
        const enteredCode = this.verificationCode.join("");
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password/verify`, {
          email: this.forgotPasswordData.email.trim().toLowerCase(),
          code: enteredCode
        });
        this.modalSuccess = "Código verificado.";
        setTimeout(() => { this.currentStep = "reset"; this.modalSuccess = ""; }, 1500);
      } catch (error) {
        this.modalError = "Código incorrecto.";
      } finally { this.isProcessing = false; }
    },

    async resetPassword() {
      this.isProcessing = true;
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password/reset`, {
          email: this.forgotPasswordData.email.trim().toLowerCase(),
          newPassword: this.forgotPasswordData.newPassword
        });
        this.modalSuccess = "Contraseña cambiada.";
        setTimeout(() => { this.closeForgotPasswordModal(); }, 2000);
      } catch (error) {
        this.modalError = "Error al restablecer.";
      } finally { this.isProcessing = false; }
    },

    // --- UTILIDADES ---
    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.codeTimer--;
        if (this.codeTimer <= 0) this.stopTimer();
      }, 1000);
    },
    
    stopTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    },

    handleCodeInput(index, event) {
      const value = event.target.value;
      if (value && /^\d$/.test(value)) {
        this.verificationCode[index] = value;
        if (index < 5) this.$refs[`codeInput${index + 1}`][0].focus();
      }
    },

    handleCodeKeydown(index, event) {
      if (event.key === "Backspace" && !this.verificationCode[index] && index > 0) {
        this.$refs[`codeInput${index - 1}`][0].focus();
      }
    },

    validateNewPassword() {
      const pwd = this.forgotPasswordData.newPassword;
      let strength = 0;
      if (pwd.length >= 8) strength++;
      if (/[A-Z]/.test(pwd)) strength++;
      if (/[0-9]/.test(pwd)) strength++;
      if (/[^A-Za-z0-9]/.test(pwd)) strength++;
      this.passwordStrength = strength;
    },

    toggleAdminPasswordVisibility() { this.showAdminPassword = !this.showAdminPassword; },
    toggleNewPasswordVisibility() { this.showNewPassword = !this.showNewPassword; },
    toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }
  },

  beforeUnmount() {
    this.stopTimer();
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cinzel:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
 
/* ══ VARIABLES ══ */
:root {
  --gold:    #C9A84C;
  --gold-lt: #E8C97A;
  --gold-dk: #8B6914;
  --amber:   #E87B2B;
  --dark:    #0D0A07;
  --dark2:   #130F0A;
  --dark3:   #1C1610;
}
 
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
/* ══ PÁGINA COMPLETA ══ */
.login-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  font-family: 'DM Sans', sans-serif;
}
 
/* Imagen de fondo bar */
.login-page::before {
  content: '';
  position: fixed; inset: 0; z-index: 0;
  background:
    url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80')
    center/cover no-repeat;
  filter: brightness(0.3) saturate(1.2);
}

/* Grid dorada sutil encima */
.background-overlay {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background:
    repeating-linear-gradient(90deg, transparent 0px, transparent 159px, rgba(201,168,76,0.04) 160px),
    repeating-linear-gradient(0deg,  transparent 0px, transparent 159px, rgba(201,168,76,0.04) 160px),
    radial-gradient(ellipse 70% 50% at 10% 20%, rgba(201,168,76,0.18) 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 90% 80%, rgba(232,123,43,0.15)  0%, transparent 70%),
    radial-gradient(circle at center, transparent 0%, rgba(13,10,7,0.4) 100%),
    linear-gradient(160deg, rgba(15,12,8,0.92) 0%, rgba(10,8,5,0.95) 50%, rgba(8,6,4,0.92) 100%);
}

.background-overlay::before{
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(201,168,76,0.15), transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(232,123,43,0.12), transparent 50%);
  filter: blur(80px);
  opacity: 0.8;
  animation: overlay-drift 20s ease-in-out infinite alternate;
}

/* Destello sutil que cruza la pantalla */
.background-overlay::after {
  content: '';
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: conic-gradient(from 180deg at 50% 50%, 
    transparent 0deg, 
    rgba(201,168,76,0.03) 40deg, 
    transparent 80deg
  );
  animation: sweep 15s linear infinite;
  z-index: -1;
}

@keyframes sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes overlay-drift{
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.1) translate(2%, 2%); }
  100% { transform: scale(1.05) translate(-1%, -1%); }
}
 
/* ══ CONTENEDOR CENTRADO ══ */
.auth-container {
  position: relative; z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 4.25rem 1.5rem 1.5rem;
  width: 100%;
}
 
/* ══ LAYOUT (LOGIN+ADMIN | INVITADO) ══ */
.auth-grid{
  width: 100%;
  max-width: 1400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4rem;
}

/* Sección de Marca Izquierda */
.auth-brand-section {
  flex: 1;
  max-width: 600px;
  animation: brand-fade 1.2s ease-out both;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-content-wrapper {
  position: relative;
  z-index: 10;
}

.brand-badge {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.3);
  border-radius: 30px;
  color: var(--gold-lt);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.brand-main-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(2.5rem, 5vw, 4.2rem);
  font-weight: 700;
  line-height: 1.1;
  color: #FFF;
  letter-spacing: -1px;
  margin-bottom: 1.5rem;
  text-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.highlight-gold {
  background: linear-gradient(135deg, #FFEA9F 0%, #E8C97A 50%, #C9A84C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(201,168,76,0.3));
}

.brand-subtitle {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-style: italic;
  color: rgba(240, 220, 180, 0.85);
  line-height: 1.6;
  max-width: 500px;
  margin-bottom: 3rem;
}

.brand-stats {
  display: flex;
  gap: 3rem;
  margin-bottom: 3rem;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.stat-number {
  font-family: 'Cinzel', serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--gold-lt);
}

.stat-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: rgba(201,168,76,0.6);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.brand-decorative-line {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
}

@keyframes brand-fade {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

.auth-grid-left{
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* Mantiene estable el panel izquierdo al cambiar vistas */
.auth-left-stage{
  width: 100%;
  max-width: 440px;
  position: relative;
  min-height: 700px;
  height: auto;
}
.auth-left-stage > .auth-card{
  position: relative;
  width: 100%;
  min-height: 100%;
  z-index: 5;
}
.auth-left-stage > .auth-card[style*="display: none"]{
  pointer-events: none;
}
.auth-left-stage .auth-view{
  max-height: 100%;
  overflow: visible;
}
.guest-benefits{
  display: grid;
  gap: 0.5rem;
  margin: 0.4rem 0 0.8rem;
  color: rgba(200,175,130,0.65);
  font-size: 0.9rem;
}
.guest-benefit{
  padding: 0.65rem 0.85rem;
  background: rgba(5,3,1,0.35);
  border: 1px solid rgba(201,168,76,0.12);
  border-radius: 8px;
}
@media (max-width: 1100px){
  .auth-grid {
    flex-direction: column;
    justify-content: center;
    gap: 3rem;
    padding: 2rem 0;
  }
  .auth-brand-section {
    text-align: center;
    align-items: center;
  }
  .brand-subtitle {
    margin-left: auto;
    margin-right: auto;
  }
  .brand-stats {
    justify-content: center;
  }
  .brand-decorative-line {
    margin: 0 auto;
  }
}
@media (max-width: 980px){
  .auth-grid{ align-items: center; }
}

/* ══ BOTONES NAV (INICIO / ADMIN) ══ */
.nav-buttons {
  position: fixed;
  top: 1.8rem; left: 1.8rem;
  display: flex; flex-direction: column; gap: 0.8rem;
  z-index: 100;
}
 
.nav-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(10,7,3,0.82);
  border: 1px solid rgba(201,168,76,0.35);
  border-radius: 30px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; font-weight: 600;
  color: rgba(240,220,180,0.9);
  letter-spacing: 0.5px;
  backdrop-filter: blur(12px);
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.nav-btn svg { width: 16px; height: 16px; stroke: currentColor; flex-shrink: 0; }
.nav-btn:hover {
  color: #FFE066;
  border-color: rgba(201,168,76,0.6);
  background: rgba(10,7,3,0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.5), 0 0 12px rgba(201,168,76,0.2);
}
 
/* ══ CARD PRINCIPAL ══ */
.auth-card {
  background: linear-gradient(145deg, rgba(28,22,14,0.97) 0%, rgba(19,14,9,0.97) 100%);
  border: 1px solid rgba(201,168,76,0.18);
  border-radius: 12px;
  width: 100%; max-width: 440px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.7),
    0 0 0 1px rgba(201,168,76,0.08),
    inset 0 1px 0 rgba(201,168,76,0.12);
  animation: card-appear 0.5s ease both;
}
@keyframes card-appear {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
 
/* Línea shimmer en el borde superior */
.auth-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 5;
  background: linear-gradient(90deg,
    transparent,
    rgba(201,168,76,0.5) 20%,
    rgba(255,200,60,0.9) 50%,
    rgba(201,168,76,0.5) 80%,
    transparent
  );
  background-size: 200%;
  animation: shimmer 3s linear infinite;
}
@keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
 
/* ══ TABS ══ */
.auth-tabs {
  display: flex;
  background: rgba(5,3,1,0.5);
  border-bottom: 1px solid rgba(201,168,76,0.1);
}
 
.tab-btn {
  flex: 1;
  padding: 1.1rem;
  border: none; background: transparent;
  color: rgba(200,175,130,0.45);
  font-family: 'Cinzel', serif;
  font-size: 0.78rem; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
  cursor: pointer; transition: all 0.25s ease;
  position: relative;
}
.tab-btn::after {
  content: '';
  position: absolute; bottom: 0; left: 10%; right: 10%; height: 2px;
  background: linear-gradient(90deg, var(--gold-dk), var(--gold-lt), var(--gold-dk));
  transform: scaleX(0); transition: transform 0.3s ease;
}
.tab-btn.active {
  color: var(--gold-lt);
  background: rgba(201,168,76,0.06);
}
.tab-btn.active::after { transform: scaleX(1); }
.tab-btn:hover:not(.active) { color: rgba(200,175,130,0.7); }
 
/* ══ CUERPO DE LA VISTA ══ */
.auth-view { padding: 2.2rem 2.2rem 2rem; }
 
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}
.auth-header h2 {
  font-family: 'Cinzel', serif;
  font-size: 1.7rem; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase;
  background: linear-gradient(135deg, #FFEA9F 0%, #E8C97A 40%, #C9A84C 75%, #FFE066 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 2px 12px rgba(201,168,76,0.35));
  margin-bottom: 0.4rem;
}
.auth-header p {
  font-family: 'Playfair Display', serif;
  font-style: italic; font-size: 0.88rem;
  color: rgba(240, 220, 180, 0.75);
  letter-spacing: 0.5px;
}
 
/* ══ FORM GENERAL ══ */
.auth-form { display: flex; flex-direction: column; gap: 1.2rem; }
 
.form-group { display: flex; flex-direction: column; gap: 0.45rem; }
 
.form-group label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
  color: rgba(201,168,76,0.6);
}
 
.form-group input,
.auth-form .form-group input {
  width: 100%;
  padding: 0.85rem 1.1rem;
  background: rgba(5,3,1,0.6);
  border: 1px solid rgba(201,168,76,0.18);
  border-radius: 6px;
  color: rgba(240,220,180,0.9);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem;
  transition: all 0.25s ease;
}
.form-group input:focus,
.auth-form .form-group input:focus {
  outline: none;
  border-color: rgba(201,168,76,0.5);
  background: rgba(5,3,1,0.8);
  box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
}
.form-group input::placeholder { color: rgba(200,175,130,0.25); }
.form-group input:disabled { opacity: 0.5; cursor: not-allowed; }
 
/* ══ OPCIONES (recordarme / olvidé contraseña) ══ */
.form-options {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 0.5rem;
}
 
.checkbox-container {
  display: flex; align-items: center; gap: 0.5rem;
  color: rgba(200,175,130,0.55);
  font-size: 0.82rem; cursor: pointer;
}
.checkbox-container input[type="checkbox"] {
  width: 14px; height: 14px;
  accent-color: var(--gold);
  cursor: pointer;
}
 
.forgot-password-btn {
  background: transparent; border: none;
  color: rgba(201,168,76,0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; cursor: pointer;
  transition: color 0.2s;
  padding: 0;
}
.forgot-password-btn:hover { color: var(--gold-lt); text-decoration: underline; }
 
.terms-link { color: var(--gold); text-decoration: none; transition: color 0.2s; }
.terms-link:hover { color: #FFEA9F; }
 
/* ══ DIVISOR GOOGLE ══ */
.google-divider {
  display: flex; align-items: center; gap: 0.8rem;
  margin: 0.2rem 0;
}
.google-divider-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
}
.google-divider-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem; font-weight: 500;
  color: rgba(200,175,130,0.35);
  letter-spacing: 0.5px; white-space: nowrap;
}
 
/* ══ BOTÓN GOOGLE ══ */
.google-login {
  display: flex; justify-content: center;
  margin: 0.2rem 0;
}

.google-login-btn {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #ffffff;
  color: #3c4043;
  font-family: 'Google Sans', Roboto, Arial, sans-serif;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.google-login-btn:hover {
  background: #f8f9fa;
  border-color: #dadce0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.google-login-btn:active {
  background: #f1f3f4;
}
 
/* ══ BOTÓN PRINCIPAL ══ */
.auth-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; padding: 0.9rem;
  background: linear-gradient(135deg, rgba(246, 204, 88, 0.238) 0%, rgba(232,123,43,0.14) 100%);
  border: 1px solid rgba(201,168,76,0.35);
  border-radius: 6px;
  color: var(--gold-lt);
  font-family: 'Cinzel', serif;
  font-size: 0.78rem; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
  cursor: pointer; margin-top: 0.5rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
.auth-btn:hover {
  background: linear-gradient(135deg, rgba(222, 171, 52, 0.23) 0%, rgba(232,123,43,0.22) 100%);
  border-color: rgba(201,168,76,0.6);
  box-shadow: 0 6px 24px rgba(0,0,0,0.4), 0 0 16px rgba(201,168,76,0.15);
  transform: translateY(-1px);
}
.auth-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
 
/* ══ MENSAJES ERROR / ÉXITO ══ */
.message {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin: 0.5rem 2.2rem 1rem;
  border: 1px solid;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
 
.message-icon { font-style: normal; font-size: 1rem; flex-shrink: 0; }
.error-message   { background: rgba(220,38,38,0.12);  border-color: rgba(220,38,38,0.3);  color: #FCA5A5; }
.success-message { background: rgba(72,187,120,0.12); border-color: rgba(72,187,120,0.3); color: #86EFAC; }
 
/* ══ SPINNER ══ */
.spinner {
  width: 16px; height: 16px; flex-shrink: 0;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
 
/* ══ VISTA ADMIN ══ */
.admin-card {
  background: linear-gradient(145deg, rgba(15,8,4,0.98) 0%, rgba(10,5,2,0.98) 100%) !important;
  border: 1px solid rgba(232,123,43,0.3) !important;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.8),
    0 0 60px rgba(232,123,43,0.08),
    inset 0 1px 0 rgba(232,123,43,0.1) !important;
  overflow: visible !important;
}
.admin-card::before {
  background: linear-gradient(90deg,
    transparent,
    rgba(232,123,43,0.5) 20%,
    rgba(255,120,30,0.9) 50%,
    rgba(232,123,43,0.5) 80%,
    transparent
  ) !important;
  background-size: 200%;
  animation: shimmer 2s linear infinite;
}
 
/* Candado animado */
.admin-lock-icon {
  position: absolute; 
  top: -28px;           /* Subido un poco menos */
  right: 32px;          /* Ajustado para centrar mejor */
  width: 52px;          /* Reducido de 72px → 52px */
  height: 52px;         /* Reducido de 72px → 52px */
  background: rgba(232,123,43,0.10);
  border: 1px solid rgba(232,123,43,0.35);
  border-radius: 50%;
  display: flex; 
  align-items: center; 
  justify-content: center;
  box-shadow: 0 0 20px rgba(232,123,43,0.25);
  animation: lock-pulse 3s ease-in-out infinite;
}
.admin-lock-icon svg,
.admin-lock-svg {
  width: 36px; height: 36px;
  stroke: var(--amber);
  filter: drop-shadow(0 0 8px rgba(232,123,43,0.6));
}
@keyframes lock-pulse {
  0%,100% { box-shadow: 0 0 20px rgba(232,123,43,0.3); }
  50%      { box-shadow: 0 0 40px rgba(232,123,43,0.6); }
}
 
/* Botón volver */
.back-to-login-btn {
  position: absolute; top: 18px; left: 18px;
  display: flex; align-items: center; gap: 0.4rem;
  background: rgba(232,123,43,0.1);
  border: 1px solid rgba(232,123,43,0.3);
  color: var(--amber);
  border-radius: 20px; padding: 0.45rem 0.9rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem; font-weight: 600;
  letter-spacing: 0.5px; cursor: pointer;
  transition: all 0.25s ease; z-index: 10;
}
.back-to-login-btn svg { width: 14px; height: 14px; }
.back-to-login-btn:hover {
  background: rgba(232,123,43,0.2);
  transform: translateX(-3px);
  box-shadow: 0 0 12px rgba(232,123,43,0.3);
}
 
/* Vista admin interior */
.admin-auth-view { padding: 3.5rem 2.2rem 2rem !important; }
 
.admin-header h2 {
  font-family: 'Cinzel', serif !important;
  font-size: 1.6rem !important; font-weight: 700 !important;
  letter-spacing: 3px !important; text-transform: uppercase;
  background: linear-gradient(135deg, #ff9c12, var(--amber), #FF6B00) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  filter: drop-shadow(0 0 16px rgba(232,123,43,0.4)) !important;
  margin-bottom: 0.4rem !important;
  animation: none !important;
}
.admin-header p {
  font-family: 'Playfair Display', serif !important;
  font-style: italic !important;
  color: rgba(251, 198, 118, 0.622) !important;
  font-size: 0.99rem !important;
}
 
.admin-form { gap: 1.4rem !important; }
 
.admin-form-group label {
  font-family: 'Cinzel', serif !important;
  font-size: 0.68rem !important; font-weight: 600 !important;
  letter-spacing: 2px !important;
  color: rgba(201, 168, 76, 0.85);
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.4rem;
}
.admin-form-group label svg {
  width: 15px; height: 15px;
  stroke: var(--amber);
  filter: drop-shadow(0 0 4px rgba(232,123,43,0.5));
}
 
.admin-input {
  width: 100%;
  padding: 0.85rem 1.1rem !important;
  background: rgba(5,2,0,0.7) !important;
  border: 1px solid rgba(232,123,43,0.2) !important;
  border-radius: 6px !important;
  color: #FFE8B8;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem;
  transition: all 0.25s ease;
}
.admin-input:focus {
  outline: none !important;
  border-color: rgba(232,123,43,0.5) !important;
  background: rgba(5,2,0,0.9) !important;
  box-shadow: 0 0 0 3px rgba(232,123,43,0.1) !important;
}
.admin-input::placeholder { color: rgba(232, 200, 140, 0.45);}
 
.admin-password-wrapper { position: relative; display: flex; align-items: center; }
.admin-password-toggle {
  position: absolute; right: 0.8rem;
  background: transparent; border: none;
  color: rgba(232,123,43,0.5);
  cursor: pointer; padding: 0.3rem; border-radius: 50%;
  transition: all 0.2s;
}
.admin-password-toggle:hover { color: var(--amber); background: rgba(232,123,43,0.1); }
.admin-password-toggle svg { width: 18px; height: 18px; stroke: currentColor; }
 
.admin-options { justify-content: center !important; }
.admin-checkbox-container {
  display: flex; align-items: center; gap: 0.5rem;
  color: rgba(200,160,100,0.5) !important;
  font-size: 0.82rem; cursor: pointer; font-weight: 500;
}
.admin-checkbox-container input[type="checkbox"] {
  width: 14px; height: 14px; accent-color: var(--amber); cursor: pointer;
}
 
/* Botón admin */
.admin-btn {
  background: linear-gradient(135deg, rgba(232,123,43,0.18) 0%, rgba(200,90,20,0.14) 100%) !important;
  border: 1px solid rgba(232,123,43,0.4) !important;
  color: #FFB347 !important;
  font-family: 'Cinzel', serif !important;
  font-size: 0.72rem !important;           /* Reducido de 0.78rem */
  font-weight: 600 !important;
  letter-spacing: 1.8px !important;        /* Ligero ajuste */
  text-transform: uppercase;
  padding: 0.75rem 1.2rem !important;      /* Más pequeño en altura y ancho */
  min-height: 48px !important;             /* Altura más compacta */
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
  transition: all 0.25s ease;
  margin-top: 0.8rem !important;
}
.admin-btn:hover {
  background: linear-gradient(135deg, rgba(232,123,43,0.28) 0%, rgba(200,90,20,0.22) 100%) !important;
  border-color: rgba(232,123,43,0.6) !important;
  box-shadow: 0 6px 20px rgba(0,0,0,0.4), 0 0 16px rgba(232,123,43,0.18) !important;
  transform: translateY(-1px);
}

.admin-btn:disabled {
  opacity: 0.45 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

.admin-btn::before { display: none !important; }
.admin-btn svg { stroke: #FFB347; filter: none !important;width: 18px; }
 
/* Mensajes admin */
.admin-card .error-message   { background: rgba(220,38,38,0.12) !important;  border-color: rgba(220,38,38,0.3) !important;  color: #FCA5A5 !important; }
.admin-card .success-message { background: rgba(72,187,120,0.12) !important; border-color: rgba(72,187,120,0.3) !important; color: #86EFAC !important; }
 
/* ══ MODAL RECUPERAR CONTRASEÑA ══ */
.modal-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(3,2,1,0.88); backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
  animation: fadeIn 0.25s ease;
}

.modal-card {
  background: linear-gradient(145deg, var(--dark3), var(--dark2));
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 10px;
  max-width: 90vw; max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.25s ease;
  display: block;
  visibility: visible;
}
 
.modal-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), var(--amber), var(--gold), transparent);
  border-radius: 10px 10px 0 0;
}
 
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.8rem 2rem 1.2rem;
  border-bottom: 1px solid rgba(201,168,76,0.08);
}
.modal-header h3 {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem; font-weight: 700; letter-spacing: 2px;
  color: #FFEA9F;
}
.close-btn {
  background: transparent;
  border: 1px solid rgba(201,168,76,0.15);
  color: rgba(200,175,130,0.4);
  width: 30px; height: 30px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.close-btn:hover { color: var(--gold); border-color: rgba(201,168,76,0.4); }
.close-btn svg { width: 14px; height: 14px; stroke: currentColor; }
 
.modal-content { padding: 1.8rem 2rem; }
 
.modal-info { text-align: center; margin-bottom: 1.8rem; }
.info-icon { font-size: 2.8rem; margin-bottom: 0.8rem; animation: none; }
.modal-info p { color: rgba(240, 220, 180, 0.70);font-size: 0.88rem; line-height: 1.7; }
.email-info   { color: rgba(200,175,130,0.35) !important; font-size: 0.82rem !important; }
 
.modal-form { display: flex; flex-direction: column; gap: 1.2rem; }
 
/* Código de verificación */
.code-input-container { display: flex; gap: 0.6rem; justify-content: center; margin: 0.8rem 0; }
.code-digit {
  width: 46px !important; height: 56px;
  text-align: center;
  font-family: 'Cinzel', serif !important;
  font-size: 1.4rem !important; font-weight: 700 !important;
  border: 1px solid rgba(201,168,76,0.2) !important;
  border-radius: 6px !important;
  background: rgba(5,3,1,0.7) !important;
  color: var(--gold-lt) !important;
  padding: 0 !important;
  transition: all 0.2s;
}
.code-digit:focus {
  border-color: rgba(201,168,76,0.5) !important;
  background: rgba(5,3,1,0.9) !important;
  box-shadow: 0 0 0 3px rgba(201,168,76,0.1) !important;
  transform: scale(1.05);
}
 
.code-timer { text-align: center; margin: 0.5rem 0; }
.timer-text { font-family: 'Cinzel', serif; font-size: 0.78rem; color: rgba(201,168,76,0.5); letter-spacing: 1px; }
 
.resend-btn {
  background: transparent;
  border: 1px solid rgba(201,168,76,0.2);
  color: rgba(201,168,76,0.6);
  padding: 0.4rem 1rem; border-radius: 20px;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
  cursor: pointer; transition: all 0.2s;
}
.resend-btn:hover { border-color: rgba(201,168,76,0.4); color: var(--gold-lt); }
 
.modal-btn {
  width: 100%; padding: 0.9rem;
  border: none; border-radius: 6px;
  font-family: 'Cinzel', serif;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
  cursor: pointer; transition: all 0.25s ease;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.modal-btn.primary {
  background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(232,123,43,0.14));
  border: 1px solid rgba(201,168,76,0.35);
  color: var(--gold-lt);
}
.modal-btn.primary:hover {
  background: linear-gradient(135deg, rgba(201,168,76,0.28), rgba(232,123,43,0.22));
  border-color: rgba(201,168,76,0.55);
  transform: translateY(-1px);
}
.modal-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
 
/* Indicadores de contraseña */
.password-input-container { position: relative; display: flex; align-items: center; }
.password-input-container input { padding-right: 3rem !important; }
.password-toggle-btn {
  position: absolute; right: 0.8rem;
  background: transparent; border: none;
  color: rgba(200,175,130,0.35); cursor: pointer;
  padding: 0.3rem; border-radius: 50%; transition: all 0.2s;
}
.password-toggle-btn:hover { color: var(--gold); }
.password-toggle-btn svg { width: 16px; height: 16px; stroke: currentColor; }
 
.password-strength { display: flex; align-items: center; gap: 0.8rem; margin-top: 0.5rem; }
.strength-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
.strength-fill { height: 100%; transition: all 0.3s; }
.strength-fill.weak   { background: #EF4444; }
.strength-fill.fair   { background: #F59E0B; }
.strength-fill.good   { background: #10B981; }
.strength-fill.strong { background: #059669; }
.strength-text { font-size: 0.72rem; font-weight: 600; min-width: 70px; }
.strength-text.weak   { color: #EF4444; }
.strength-text.fair   { color: #FBBF24; }
.strength-text.good   { color: #34D399; }
.strength-text.strong { color: #10B981; }
 
.password-match { margin-top: 0.4rem; font-size: 0.8rem; font-weight: 600; }
.match-success { color: #34D399; }
.match-error   { color: #EF4444; }
 
/* ══ SUSPENDED ACCOUNT MODAL ══ */
.suspended-modal {
  max-width: 500px;
  border: 2px solid rgba(239, 68, 68, 0.3);
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
}

.suspended-header {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border-bottom: 1px solid rgba(239, 68, 68, 0.3);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.suspended-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
  border-radius: 50%;
  border: 2px solid rgba(239, 68, 68, 0.4);
  animation: pulse-red 2s infinite;
}

.suspended-icon {
  font-size: 2rem;
  animation: lock-pulse 1.5s ease-in-out infinite;
}

.suspended-header h3 {
  margin: 0;
  color: #ef4444;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

.suspended-content {
  padding: 2rem;
}

.suspended-warning {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.warning-icon {
  font-size: 2rem;
  animation: warning-shake 0.5s ease-in-out infinite alternate;
  flex-shrink: 0;
}

.warning-text h4 {
  color: #ef4444;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.warning-text p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0;
  line-height: 1.5;
}

.reason-text {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9) !important;
  margin-top: 1rem !important;
}

.reason-list {
  margin: 0.5rem 0 0 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.reason-list li {
  margin: 0.3rem 0;
  list-style-type: none;
  position: relative;
}

.reason-list li::before {
  content: "🔴";
  margin-right: 0.5rem;
  font-size: 0.8rem;
}

.suspended-actions {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 1.5rem;
}

.action-info p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0;
  line-height: 1.5;
}

.action-info strong {
  color: rgba(255, 255, 255, 0.95);
}

.contact-info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.contact-value {
  color: #60a5fa;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.modal-actions .modal-btn.primary {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
  padding: 0.8rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modal-actions .modal-btn.primary:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2));
  border-color: rgba(239, 68, 68, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

/* Animations */
@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

@keyframes lock-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes warning-shake {
  0% { transform: translateX(0); }
  100% { transform: translateX(2px); }
}

/* ══ GOOGLE LOGIN SUSPENDED MODAL ══ */
.google-suspended-modal {
  max-width: 500px;
  max-height: 90vh;
  border: 2px solid rgba(234, 67, 53, 0.3);
  box-shadow: 0 0 30px rgba(234, 67, 53, 0.2);
  background: linear-gradient(145deg, rgba(40,40,40,0.95), rgba(30,30,30,0.95));
  overflow-y: auto;
}

.scrollable-modal {
  max-height: 85vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(234, 67, 53, 0.3) transparent;
}

.scrollable-modal::-webkit-scrollbar {
  width: 8px;
}

.scrollable-modal::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.scrollable-modal::-webkit-scrollbar-thumb {
  background: rgba(234, 67, 53, 0.5);
  border-radius: 4px;
}

.scrollable-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(234, 67, 53, 0.7);
}

.google-suspended-header {
  background: linear-gradient(135deg, rgba(234, 67, 53, 0.1), rgba(219, 68, 55, 0.05));
  border-bottom: 1px solid rgba(234, 67, 53, 0.3);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.google-suspended-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(234, 67, 53, 0.2), rgba(219, 68, 55, 0.1));
  border-radius: 50%;
  border: 2px solid rgba(234, 67, 53, 0.4);
  animation: google-pulse-red 2s infinite;
}

.google-suspended-icon {
  font-size: 2rem;
  animation: google-block-pulse 1.5s ease-in-out infinite;
}

.google-suspended-header h3 {
  margin: 0;
  color: #ea4335;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(234, 67, 53, 0.3);
}

.google-suspended-content {
  padding: 2rem;
  color: #ffffff;
}

.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(234, 67, 53, 0.4);
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(234, 67, 53, 0.6);
}

.google-suspended-warning {
  background: rgba(234, 67, 53, 0.05);
  border: 1px solid rgba(234, 67, 53, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.google-warning-icon {
  font-size: 2rem;
  animation: google-warning-shake 0.5s ease-in-out infinite alternate;
  flex-shrink: 0;
}

.google-warning-text h4 {
  color: #ea4335;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.google-warning-text p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0;
  line-height: 1.5;
}

.google-reason-text {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9) !important;
  margin-top: 1rem !important;
}

.google-reason-list {
  margin: 0.5rem 0 0 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.google-reason-list li {
  margin: 0.3rem 0;
  list-style-type: none;
  position: relative;
}

.google-reason-list li::before {
  content: "🔴";
  margin-right: 0.5rem;
  font-size: 0.8rem;
}

.google-suspended-actions {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 1.5rem;
}

.google-action-info p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0;
  line-height: 1.5;
}

.google-action-info strong {
  color: rgba(255, 255, 255, 0.95);
}

.google-contact-info {
  background: rgba(66, 133, 244, 0.1);
  border: 1px solid rgba(66, 133, 244, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.google-contact-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.google-contact-value {
  color: #4285f4;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.modal-actions .google-primary {
  background: linear-gradient(135deg, rgba(234, 67, 53, 0.2), rgba(219, 68, 55, 0.1));
  border: 1px solid rgba(234, 67, 53, 0.4);
  color: #ea4335;
  padding: 0.8rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modal-actions .google-primary:hover {
  background: linear-gradient(135deg, rgba(234, 67, 53, 0.3), rgba(219, 68, 55, 0.2));
  border-color: rgba(234, 67, 53, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(234, 67, 53, 0.3);
}

/* Google Modal Animations */
@keyframes google-pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(234, 67, 53, 0); }
  100% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0); }
}

@keyframes google-block-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes google-warning-shake {
  0% { transform: translateX(0); }
  100% { transform: translateX(2px); }
}
 
/* ══ RESPONSIVE ══ */
@media (max-width: 500px) {
  .auth-container { padding: 5rem 1rem 1.5rem; }
  .auth-view { padding: 1.8rem 1.5rem; }
  .admin-auth-view { padding: 3rem 1.5rem 1.5rem !important; }
  .modal-content { padding: 1.5rem; }
  .code-digit { width: 38px !important; height: 48px; font-size: 1.2rem !important; }
  .nav-buttons { top: 1rem; left: 1rem; }
  .admin-lock-icon { width: 60px; height: 60px; top: -28px; right: 20px; }
}
</style>