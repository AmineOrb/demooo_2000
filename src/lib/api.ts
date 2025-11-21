// API and utility functions for the AI Interview Simulator

export interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'premium';
  interviewsRemaining: number;
  emailVerified: boolean;
  verificationToken?: string;
}

export interface Interview {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  avatarType: 'easy' | 'medium' | 'hard';
  language: 'en' | 'ar';
  date: string;
  duration: number;
  score: number;
  status: 'completed' | 'in-progress';
}

export interface InterviewReport {
  interviewId: string;
  overallScore: number;
  communication: number;
  confidence: number;
  technical: number;
  structure: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

// Mock authentication
export const authService = {
  currentUser: null as User | null,

  async signUp(email: string, _password: string, name: string): Promise<User> {
    // Generate verification token
    const verificationToken = Math.random().toString(36).substr(2, 9);
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      subscription: 'free',
      interviewsRemaining: 2,
      emailVerified: false,
      verificationToken,
    };
    
    // Store user with unverified status
    localStorage.setItem('pendingUser', JSON.stringify(user));
    
    // In production, send verification email here
    console.log(`Verification email sent to ${email}`);
    console.log(`Verification link: /verify-email?token=${verificationToken}`);
    
    return user;
  },

  async verifyEmail(token: string): Promise<boolean> {
    const pendingUser = localStorage.getItem('pendingUser');
    if (!pendingUser) return false;
    
    const user: User = JSON.parse(pendingUser);
    if (user.verificationToken === token) {
      user.emailVerified = true;
      delete user.verificationToken;
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('pendingUser');
      return true;
    }
    return false;
  },

  async resendVerificationEmail(email: string): Promise<void> {
    const pendingUser = localStorage.getItem('pendingUser');
    if (pendingUser) {
      const user: User = JSON.parse(pendingUser);
      console.log(`Verification email resent to ${email}`);
      console.log(`Verification link: /verify-email?token=${user.verificationToken}`);
    }
  },

  async signIn(email: string, _password: string): Promise<User> {
    // Check for verified user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      if (user.email === email && user.emailVerified) {
        this.currentUser = user;
        return user;
      }
    }
    
    // Check for pending verification
    const pendingUser = localStorage.getItem('pendingUser');
    if (pendingUser) {
      const user: User = JSON.parse(pendingUser);
      if (user.email === email && !user.emailVerified) {
        throw new Error('EMAIL_NOT_VERIFIED');
      }
    }
    
    throw new Error('User not found or invalid credentials');
  },

  async signInWithGoogle(): Promise<User> {
    // Google users are automatically verified
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: 'user@gmail.com',
      name: 'Google User',
      subscription: 'free',
      interviewsRemaining: 2,
      emailVerified: true,
    };
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return this.currentUser;
    }
    return null;
  },

  getPendingUser(): User | null {
    const pendingUser = localStorage.getItem('pendingUser');
    return pendingUser ? JSON.parse(pendingUser) : null;
  },

  updateSubscription(subscription: 'free' | 'premium'): void {
    if (this.currentUser) {
      this.currentUser.subscription = subscription;
      this.currentUser.interviewsRemaining = subscription === 'premium' ? 999 : 2;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  },
};

// Mock interview service
export const interviewService = {
  async createInterview(data: {
    jobTitle: string;
    jobDescription: string;
    avatarType: 'easy' | 'medium' | 'hard';
    language: 'en' | 'ar';
  }): Promise<Interview> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    if (!user.emailVerified) throw new Error('Email not verified');

    const interview: Interview = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      ...data,
      date: new Date().toISOString(),
      duration: 0,
      score: 0,
      status: 'in-progress',
    };

    const interviews = this.getInterviews();
    interviews.push(interview);
    localStorage.setItem('interviews', JSON.stringify(interviews));

    return interview;
  },

  async completeInterview(interviewId: string, duration: number): Promise<InterviewReport> {
    const interviews = this.getInterviews();
    const interview = interviews.find((i) => i.id === interviewId);
    
    if (!interview) throw new Error('Interview not found');

    // Generate mock AI report
    const report: InterviewReport = {
      interviewId,
      overallScore: Math.floor(Math.random() * 30 + 65), // 65-95
      communication: Math.floor(Math.random() * 30 + 65),
      confidence: Math.floor(Math.random() * 30 + 65),
      technical: Math.floor(Math.random() * 30 + 65),
      structure: Math.floor(Math.random() * 30 + 65),
      strengths: [
        'Clear and articulate communication',
        'Good understanding of the role requirements',
        'Confident body language and eye contact',
      ],
      weaknesses: [
        'Could provide more specific examples',
        'Some answers were too brief',
      ],
      suggestions: [
        'Practice the STAR method for behavioral questions',
        'Research the company more thoroughly',
        'Prepare more technical examples from past experience',
      ],
    };

    interview.status = 'completed';
    interview.duration = duration;
    interview.score = report.overallScore;
    localStorage.setItem('interviews', JSON.stringify(interviews));

    // Store report
    const reports = this.getReports();
    reports.push(report);
    localStorage.setItem('reports', JSON.stringify(reports));

    // Decrease remaining interviews for free users
    const user = authService.getCurrentUser();
    if (user && user.subscription === 'free' && user.interviewsRemaining > 0) {
      user.interviewsRemaining--;
      localStorage.setItem('user', JSON.stringify(user));
    }

    return report;
  },

  getInterviews(): Interview[] {
    const stored = localStorage.getItem('interviews');
    return stored ? JSON.parse(stored) : [];
  },

  getReports(): InterviewReport[] {
    const stored = localStorage.getItem('reports');
    return stored ? JSON.parse(stored) : [];
  },

  getReport(interviewId: string): InterviewReport | null {
    const reports = this.getReports();
    return reports.find((r) => r.interviewId === interviewId) || null;
  },
};

// Mock questions based on difficulty
export const getInterviewQuestions = (
  avatarType: 'easy' | 'medium' | 'hard',
  language: 'en' | 'ar'
): string[] => {
  const questions = {
    easy: {
      en: [
        'Tell me about yourself.',
        'Why are you interested in this position?',
        'What are your greatest strengths?',
        'Where do you see yourself in 5 years?',
      ],
      ar: [
        'أخبرني عن نفسك.',
        'لماذا أنت مهتم بهذا المنصب؟',
        'ما هي أعظم نقاط قوتك؟',
        'أين ترى نفسك بعد 5 سنوات؟',
      ],
    },
    medium: {
      en: [
        'Describe a challenging project you worked on.',
        'How do you handle conflict in a team?',
        'What is your approach to problem-solving?',
        'Tell me about a time you failed and what you learned.',
        'How do you prioritize tasks when everything is urgent?',
      ],
      ar: [
        'صف مشروعًا صعبًا عملت عليه.',
        'كيف تتعامل مع الصراع في الفريق؟',
        'ما هو نهجك في حل المشكلات؟',
        'أخبرني عن وقت فشلت فيه وماذا تعلمت.',
        'كيف تحدد أولويات المهام عندما يكون كل شيء عاجلاً؟',
      ],
    },
    hard: {
      en: [
        'Walk me through a complex technical decision you made.',
        'How would you design a system to handle millions of users?',
        'Describe a situation where you had to influence without authority.',
        'What would you do if you disagreed with your manager on a critical decision?',
        'How do you stay current with industry trends and technologies?',
        'Tell me about a time when you had to make a decision with incomplete information.',
      ],
      ar: [
        'اشرح لي قرارًا تقنيًا معقدًا اتخذته.',
        'كيف ستصمم نظامًا للتعامل مع ملايين المستخدمين؟',
        'صف موقفًا كان عليك فيه التأثير بدون سلطة.',
        'ماذا ستفعل إذا اختلفت مع مديرك في قرار حاسم؟',
        'كيف تبقى على اطلاع دائم باتجاهات الصناعة والتقنيات؟',
        'أخبرني عن وقت كان عليك فيه اتخاذ قرار بمعلومات غير كاملة.',
      ],
    },
  };

  return questions[avatarType][language];
};

export const getAvatarDuration = (avatarType: 'easy' | 'medium' | 'hard'): number => {
  const durations = {
    easy: 5 * 60, // 5 minutes in seconds
    medium: 10 * 60, // 10 minutes
    hard: 15 * 60, // 15 minutes
  };
  return durations[avatarType];
};