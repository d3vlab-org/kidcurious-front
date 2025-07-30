import { projectId, publicAnonKey } from '../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d8aca400`;

interface ProcessQuestionRequest {
  question: string;
  childId: string;
  childAge: number;
}

interface ProcessQuestionResponse {
  success?: boolean;
  flagged?: boolean;
  reason?: string;
  message?: string;
  answer?: string;
  videoSuggestion?: string;
  conversationId?: string;
}

interface ConversationHistory {
  conversations: Array<{
    question: string;
    answer: string;
    childId: string;
    timestamp: string;
    approved: boolean;
    parentApproved?: boolean;
  }>;
}

interface FlaggedQuestions {
  flagged: Array<{
    question: string;
    childId: string;
    reason: string;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

class KidAskAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API Error: ${errorData.error || response.statusText}`);
    }

    return response.json();
  }

  async processQuestion(data: ProcessQuestionRequest): Promise<ProcessQuestionResponse> {
    try {
      return await this.request('/process-question', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error processing question:', error);
      throw error;
    }
  }

  async getConversationHistory(childId: string): Promise<ConversationHistory> {
    try {
      return await this.request(`/history/${childId}`);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  }

  async getFlaggedQuestions(childId: string): Promise<FlaggedQuestions> {
    try {
      return await this.request(`/flagged/${childId}`);
    } catch (error) {
      console.error('Error fetching flagged questions:', error);
      throw error;
    }
  }

  async updateContentFilters(childId: string, filters: any): Promise<{ success: boolean }> {
    try {
      return await this.request(`/filters/${childId}`, {
        method: 'POST',
        body: JSON.stringify(filters),
      });
    } catch (error) {
      console.error('Error updating content filters:', error);
      throw error;
    }
  }

  async moderateQuestion(questionId: string, action: 'approve' | 'reject', childId: string): Promise<{ success: boolean }> {
    try {
      return await this.request(`/moderate/${questionId}`, {
        method: 'POST',
        body: JSON.stringify({ action, childId }),
      });
    } catch (error) {
      console.error('Error moderating question:', error);
      throw error;
    }
  }

  async exportUserData(childId: string): Promise<any> {
    try {
      return await this.request(`/export/${childId}`);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  async deleteUserData(childId: string): Promise<{ success: boolean; deletedItems: number }> {
    try {
      return await this.request(`/delete/${childId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.request('/health');
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  }
}

export const kidAskAPI = new KidAskAPI();