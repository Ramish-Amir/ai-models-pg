import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../database/entities/user.entity";

/**
 * Authentication service for managing user operations.
 *
 * This service handles:
 * - User creation and updates from Auth0
 * - User profile management
 * - User session management
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * Creates or updates a user based on Auth0 user information.
   * This method is called when a user authenticates for the first time
   * or when their profile information changes.
   */
  async createOrUpdateUser(auth0User: {
    auth0Id: string;
    email: string;
    name?: string;
    picture?: string;
    locale?: string;
  }): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { auth0Id: auth0User.auth0Id },
    });

    if (existingUser) {
      // Update existing user
      existingUser.email = auth0User.email;
      existingUser.name = auth0User.name || existingUser.name;
      existingUser.picture = auth0User.picture || existingUser.picture;
      existingUser.locale = auth0User.locale || existingUser.locale;
      existingUser.isActive = true;

      return await this.userRepository.save(existingUser);
    } else {
      // Create new user
      const newUser = this.userRepository.create({
        auth0Id: auth0User.auth0Id,
        email: auth0User.email,
        name: auth0User.name,
        picture: auth0User.picture,
        locale: auth0User.locale || "en",
        isActive: true,
      });

      return await this.userRepository.save(newUser);
    }
  }

  /**
   * Finds a user by their Auth0 ID.
   */
  async findUserByAuth0Id(auth0Id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { auth0Id, isActive: true },
    });
  }

  /**
   * Finds a user by their database ID.
   */
  async findUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, isActive: true },
    });
  }

  /**
   * Deactivates a user account.
   */
  async deactivateUser(auth0Id: string): Promise<void> {
    await this.userRepository.update({ auth0Id }, { isActive: false });
  }
}
