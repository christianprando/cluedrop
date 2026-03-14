import {
  IGameService,
  IStatisticsService,
  IShareService,
  IStorageService,
  IPuzzleRepository,
} from '@/domain/services';
import {
  GameService,
  StatisticsService,
  ShareService,
  LocalStorageService,
} from '@/infrastructure/services';
import { StaticPuzzleRepository } from '@/infrastructure/repositories';
import { PUZZLES } from '@/data/puzzles';

/**
 * Dependency Injection Container
 * Manages service instances and their dependencies
 */
export class Container {
  private static instance: Container;

  private _puzzleRepository: IPuzzleRepository;
  private _storageService: IStorageService;
  private _gameService: IGameService;
  private _statisticsService: IStatisticsService;
  private _shareService: IShareService;

  private constructor() {
    // Initialize all services (singleton pattern)
    this._puzzleRepository = new StaticPuzzleRepository(PUZZLES);
    this._storageService = new LocalStorageService();
    this._gameService = new GameService();
    this._statisticsService = new StatisticsService();
    this._shareService = new ShareService();
  }

  /**
   * Get singleton instance of container
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Reset the container (useful for testing)
   */
  static reset(): void {
    Container.instance = new Container();
  }

  // Getters for services
  get puzzleRepository(): IPuzzleRepository {
    return this._puzzleRepository;
  }

  get storageService(): IStorageService {
    return this._storageService;
  }

  get gameService(): IGameService {
    return this._gameService;
  }

  get statisticsService(): IStatisticsService {
    return this._statisticsService;
  }

  get shareService(): IShareService {
    return this._shareService;
  }
}

/**
 * Convenience function to get container instance
 */
export function getContainer(): Container {
  return Container.getInstance();
}
