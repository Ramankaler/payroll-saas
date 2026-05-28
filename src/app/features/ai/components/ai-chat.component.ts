import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_ROUTES } from '../../../core/config/api.config';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';

type ChatMessage = { from: 'user' | 'ai'; text: string };

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
})
export class AiChatComponent {

  // Constructor
  // Angular automatically HttpClient te Store inject kruga
  constructor(
    private http: HttpClient,
    private store: Store
  )
  {
    // Login hoye user da auth data localStorage ton read kr reha
    const auth = localStorage.getItem('auth');

    // Je auth data exist krda
    if (auth)
    {
      // JSON string nu object ch convert kr reha
      const parsed = JSON.parse(auth);

      // Logged in employee di ID save kr reha
      this.employeeId = Number(parsed.userId);
    }
  }

  // Chat messages array
  messages: ChatMessage[] = [
    {
      from: 'ai',
      text: 'Ask me about payroll, attendance import, leave workflow, or reports.'
    },
  ];

  // User input message
  message = '';

  // Logged in employee id
  employeeId: number = 0;

  // Suggestions array
  suggestions: string[] | null = null;

  // Send button function
  send()
  {
    // Extra spaces remove kr reha
    const text = this.message.trim();

    // Je empty message aa
    // function stop
    if (!text) return;

    // User message UI te show kr reha
    this.messages.push({
      from: 'user',
      text
    });

    // Input clear
    this.message = '';

    // Suggestions clear
    this.suggestions = null;

    // Backend API call
    this.http.post<any>(
      API_ROUTES.aiChat,
      {
        employeeId: this.employeeId,
        message: text
      }
    )
    .subscribe({

      // Success response
      next: (res) =>
      {
        // AI response UI te add
        this.messages.push({
          from: 'ai',
          text: res.reply ?? JSON.stringify(res)
        });

        // Suggestions save
        this.suggestions = res.suggestedNavigation ?? [];
      },

      // Error handling
      error: (err) =>
      {
        this.messages.push({
          from: 'ai',
          text: err?.error?.detail ?? 'AI request failed'
        });
      },
    });
  }



  selectSuggestion(value:string){
      // Chip value input box ch paa reha
  this.message = value;

  // Automatically send kr reha
  this.send();
  }
}
