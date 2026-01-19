import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';
import { Socket, Server } from 'socket.io';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  // English: Mocking the Socket.io Server and Socket
  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  const mockSocket = {
    id: 'socket_123',
    join: jest.fn(),
  } as unknown as Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: {} }, // Mock simple para el Guard
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    // English: Manually inject the mocked server into the gateway
    gateway.server = mockServer as unknown as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleJoinTeam', () => {
    it('should join the correct team room', () => {
      const teamId = 5;
      gateway.handleJoinTeam(teamId, mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith(`team_${teamId}`);
    });
  });

  describe('notifyInvitationAccepted', () => {
    it('should emit INVITATION_ACCEPTED to the specific team room', () => {
      const teamId = 10;
      const userName = 'Alice';

      gateway.notifyInvitationAccepted(teamId, userName);

      // English: Verify it targets the correct room
      expect(mockServer.to).toHaveBeenCalledWith(`team_${teamId}`);
      // English: Verify the payload structure
      expect(mockServer.emit).toHaveBeenCalledWith('notification', {
        type: 'INVITATION_ACCEPTED',
        message: `${userName} has joined the team!`,
      });
    });
  });

  describe('notifyTaskUpdate', () => {
    it('should emit TASK_UPDATE with the correct action', () => {
      const teamId = 1;
      const taskTitle = 'Fix Bug';
      const action = 'completed';

      gateway.notifyTaskUpdate(teamId, taskTitle, action);

      expect(mockServer.to).toHaveBeenCalledWith(`team_${teamId}`);
      expect(mockServer.emit).toHaveBeenCalledWith('notification', {
        type: 'TASK_UPDATE',
        message: `Task "${taskTitle}" was completed`,
      });
    });
  });
});
