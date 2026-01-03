import { OnEvent } from '@nestjs/event-emitter';
import { Inject, Injectable } from '@nestjs/common';
import { UserCreatedEvent } from '../events/user-created.event';
import { MailService } from 'src/shared/mail/mail.service';
import { LoggerService } from '../../config/logging/logger.service';

@Injectable()
export class SendEmailWelcomeListener {
  constructor(
    private readonly mailService: MailService,
    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    this.mailService
      .sendUserWelcome(event.email, event.fullName)
      .catch((error) => {
        this.logger.error(
          `Erro ao enviar e-mail de boas-vindas para ${event.email}`,
          error.stack,
          'UserCreatedListener',
        );
      });
  }
}
