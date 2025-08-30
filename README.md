# Backend Starter Pack

Node.js Express TypeScript backend with Sequelize ORM and professional three-layer architecture.

## Project Structure

```
src/
├── config/          # Database configuration
├── lib/             # Express app setup
├── types/           # Common type definitions
├── dto/             # Data Transfer Objects (API contracts)
├── interfaces/      # Service and Repository contracts
├── models/          # Sequelize database models
├── controllers/     # HTTP handlers (Layer 1: Presentation)
├── services/        # Business logic (Layer 2: Service)
├── repositories/    # Database operations (Layer 3: Data)
├── routes/          # API route definitions
└── middleware/      # Express middleware
```

## Three-Layer Architecture

### Layer 1: Controllers (Presentation Layer)
- **Purpose**: Handle HTTP requests/responses only
- **Location**: `src/controllers/`
- **What to add**: Request validation, response formatting, HTTP status codes
- **Example**:
```typescript
// UserController.ts
export class UserController {
  constructor(private userService: IUserService) {}
  
  async createUser(req: Request, res: Response): Promise<void> {
    const userData: CreateUserDto = req.body;
    const user = await this.userService.createUser(userData);
    res.status(201).json({ success: true, data: user });
  }
}
```

### Layer 2: Services (Business Logic Layer)
- **Purpose**: Business rules, validation, orchestration
- **Location**: `src/services/`
- **What to add**: Business validation, data transformation, complex logic
- **Example**:
```typescript
// UserService.ts
export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}
  
  async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
    // Business validation
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Business logic (hash password, etc.)
    const user = await this.userRepository.create(userData);
    return this.mapToResponseDto(user);
  }
}
```

### Layer 3: Repositories (Data Layer)
- **Purpose**: Database interactions only
- **Location**: `src/repositories/`
- **What to add**: Database queries, ORM operations
- **Example**:
```typescript
// UserRepository.ts
export class UserRepository implements IUserRepository {
  async create(userData: Partial<User>): Promise<User> {
    return await User.create(userData);
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }
}
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`

3. Build the project:
   ```bash
   npm run build
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Start production server:
   ```bash
   npm start
   ```

## Adding New Features

### 1. Define DTOs (Data Transfer Objects)
```typescript
// src/dto/product.dto.ts
export interface CreateProductDto {
  name: string;
  price: number;
}
```

### 2. Create Service Interface
```typescript
// src/interfaces/IProductService.ts
export interface IProductService {
  createProduct(data: CreateProductDto): Promise<ProductResponseDto>;
}
```

### 3. Create Repository Interface
```typescript
// src/interfaces/IProductRepository.ts
export interface IProductRepository {
  create(data: Partial<Product>): Promise<Product>;
}
```

### 4. Implement Repository (Data Layer)
```typescript
// src/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  async create(data: Partial<Product>): Promise<Product> {
    return await Product.create(data);
  }
}
```

### 5. Implement Service (Business Layer)
```typescript
// src/services/ProductService.ts
export class ProductService implements IProductService {
  constructor(private productRepository: IProductRepository) {}
  
  async createProduct(data: CreateProductDto): Promise<ProductResponseDto> {
    // Add business logic here
    return await this.productRepository.create(data);
  }
}
```

### 6. Implement Controller (Presentation Layer)
```typescript
// src/controllers/ProductController.ts
export class ProductController {
  constructor(private productService: IProductService) {}
  
  async createProduct(req: Request, res: Response): Promise<void> {
    const product = await this.productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  }
}
```

### 7. Add Routes
```typescript
// src/routes/productRoutes.ts
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.post('/', (req, res) => productController.createProduct(req, res));
```

## API Endpoints

- `GET /api/users` - Get all users with pagination
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Benefits of This Architecture

- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to unit test each layer independently
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Easy to add new features following the same pattern
- **Type Safety**: Full TypeScript support with interfaces and DTOs