# SponGo Platform System Design

## Implementation Approach

After analyzing the requirements in the PRD, I've identified the following key challenges and implementation approaches:

### Key Challenges

1. **Real-time Data Synchronization**: Ensuring organizer-created events are immediately visible to sponsors with minimal delay (<0.5s)
2. **Dynamic UI Updates**: Managing the shopping cart on the left side and dynamically updating available slots when packages are selected
3. **Role-Based Access**: Implementing a seamless role-switching mechanism between organizer and sponsor views
4. **Meeting Integration**: Integrating with external services (Google Meet, Calendly) for scheduling meetings

### Technology Stack Selection

1. **Frontend**:
   - React with TypeScript for type safety
   - Redux Toolkit for state management
   - Tailwind CSS for responsive design
   - React Query for data fetching and caching
   - Socket.io client for real-time updates

2. **Backend**:
   - Node.js with Express for API server
   - Socket.io for real-time data synchronization
   - MongoDB for database (flexible schema suits event management)
   - Redis for caching and pub/sub mechanism

3. **External Integrations**:
   - Google Calendar API for meeting scheduling
   - Calendly API for advanced scheduling options

4. **DevOps**:
   - Docker for containerization
   - CI/CD pipeline for automated testing and deployment

### Architecture Style

We will implement a microservice-based architecture with the following components:

1. **Authentication Service**: Handles user authentication and role management
2. **Event Service**: Manages event creation, updates, and retrieval
3. **Sponsorship Service**: Handles sponsorship packages and slot management
4. **Meeting Service**: Integrates with external meeting scheduling services
5. **Notification Service**: Manages real-time updates and notifications

This approach allows for independent scaling of services based on load and ensures separation of concerns.

## Data Structures and Interfaces

### Core Entities

```mermaid
classDiagram
    User <|-- Organizer
    User <|-- Sponsor
    Organizer "1" -- "*" Event
    Event "1" -- "*" Package
    Package "1" -- "*" Slot
    Sponsor "1" -- "*" Cart
    Cart "1" -- "*" CartItem
    CartItem "1" -- "1" Package
    CartItem "1" -- "0..1" Slot
    CartItem "1" -- "0..1" Meeting
    Meeting "1" -- "1" MeetingType
    
    class User {
        +string id
        +string username
        +string email
        +string password
        +string role
        +authenticate()
        +switchRole()
    }

    class Organizer {
        +createEvent()
        +updateEvent()
        +managePackages()
        +manageSlots()
    }

    class Sponsor {
        +browseEvents()
        +selectPackage()
        +bookSlot()
        +scheduleMeeting()
        +checkout()
    }

    class Event {
        +string id
        +string title
        +string description
        +string mainCategory
        +string subCategory
        +string[] tags
        +Date startDate
        +Date endDate
        +string timezone
        +number duration
        +Address address
        +Organizer organizer
        +Package[] packages
        +boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    class Address {
        +string street
        +string city
        +string state
        +string zipCode
        +string country
    }

    class Package {
        +string id
        +string name
        +string description
        +number price
        +number totalSlots
        +number availableSlots
        +Event event
        +Slot[] slots
    }

    class Slot {
        +string id
        +Date startTime
        +Date endTime
        +string status
        +Package package
    }

    class Cart {
        +string id
        +Sponsor sponsor
        +CartItem[] items
        +number total
        +Date createdAt
        +Date updatedAt
        +addItem()
        +removeItem()
        +updateItem()
        +calculateTotal()
        +clear()
    }

    class CartItem {
        +string id
        +Package package
        +Slot slot
        +Meeting meeting
        +Date addedAt
    }

    class Meeting {
        +string id
        +string meetingType
        +string title
        +string[] participants
        +string notes
        +string meetingUrl
        +Date scheduledFor
        +createGoogleMeetLink()
        +createCalendlyLink()
    }

    class MeetingType {
        <<enumeration>>
        GOOGLE_MEET
        CALENDLY
    }
```

### Service Interfaces

#### Authentication Service

```typescript
interface AuthenticationService {
  login(username: string, password: string): Promise<User>;
  logout(userId: string): Promise<void>;
  register(userData: UserRegistrationData): Promise<User>;
  switchRole(userId: string, newRole: string): Promise<User>;
  getCurrentUser(token: string): Promise<User>;
}
```

#### Event Service

```typescript
interface EventService {
  createEvent(eventData: EventCreationData): Promise<Event>;
  getEvent(eventId: string): Promise<Event>;
  updateEvent(eventId: string, eventData: EventUpdateData): Promise<Event>;
  deleteEvent(eventId: string): Promise<void>;
  listEvents(filters?: EventFilters): Promise<Event[]>;
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;
}
```

#### Package Service

```typescript
interface PackageService {
  createPackage(packageData: PackageCreationData): Promise<Package>;
  getPackage(packageId: string): Promise<Package>;
  updatePackage(packageId: string, packageData: PackageUpdateData): Promise<Package>;
  deletePackage(packageId: string): Promise<void>;
  getPackagesByEvent(eventId: string): Promise<Package[]>;
  getAvailableSlots(packageId: string): Promise<Slot[]>;
}
```

#### Cart Service

```typescript
interface CartService {
  getCart(sponsorId: string): Promise<Cart>;
  addToCart(sponsorId: string, packageId: string, slotId?: string): Promise<Cart>;
  removeFromCart(sponsorId: string, cartItemId: string): Promise<Cart>;
  updateCartItem(sponsorId: string, cartItemId: string, updates: CartItemUpdateData): Promise<Cart>;
  clearCart(sponsorId: string): Promise<void>;
}
```

#### Meeting Service

```typescript
interface MeetingService {
  scheduleMeeting(meetingData: MeetingCreationData): Promise<Meeting>;
  getMeeting(meetingId: string): Promise<Meeting>;
  updateMeeting(meetingId: string, meetingData: MeetingUpdateData): Promise<Meeting>;
  cancelMeeting(meetingId: string): Promise<void>;
  createGoogleMeetLink(meetingDetails: MeetingDetails): Promise<string>;
  createCalendlyLink(meetingDetails: MeetingDetails): Promise<string>;
}
```

#### Notification Service

```typescript
interface NotificationService {
  subscribeToEventUpdates(userId: string, eventId: string): Promise<void>;
  unsubscribeFromEventUpdates(userId: string, eventId: string): Promise<void>;
  notifyEventUpdated(eventId: string): Promise<void>;
  notifyPackageUpdated(packageId: string): Promise<void>;
  notifySlotBooked(slotId: string): Promise<void>;
}
```

## Program Call Flow

### User Authentication and Role Switching

```mermaid
sequenceDiagram
    participant Client
    participant AuthService as Authentication Service
    participant UserDB as User Database
    
    Client->>AuthService: login(username, password)
    AuthService->>UserDB: validateCredentials(username, password)
    UserDB-->>AuthService: return user
    AuthService-->>Client: return user with JWT token
    
    Client->>AuthService: switchRole(userId, newRole)
    AuthService->>UserDB: updateUserRole(userId, newRole)
    UserDB-->>AuthService: return updated user
    AuthService-->>Client: return updated user data
    
    Client->>Client: updateUI(role)
```

### Event Creation by Organizer

```mermaid
sequenceDiagram
    participant Organizer
    participant API as API Gateway
    participant EventService
    participant PackageService
    participant EventDB as Event Database
    participant NotificationService
    participant SponsorClient as Sponsor Clients
    
    Organizer->>API: createEvent(eventData)
    API->>EventService: createEvent(eventData)
    EventService->>EventDB: save(eventData)
    EventDB-->>EventService: return saved event
    EventService-->>API: return event
    API-->>Organizer: return event
    
    Organizer->>API: createPackage(packageData)
    API->>PackageService: createPackage(packageData)
    PackageService->>EventDB: save(packageData)
    EventDB-->>PackageService: return saved package
    PackageService-->>API: return package
    API-->>Organizer: return package
    
    Organizer->>API: createTimeSlots(eventId, packageId, slotData)
    API->>PackageService: createSlots(packageId, slotData)
    PackageService->>EventDB: save(slotData)
    EventDB-->>PackageService: return saved slots
    PackageService-->>API: return slots
    API-->>Organizer: return slots
    
    API->>NotificationService: notifyEventCreated(eventId)
    NotificationService->>SponsorClient: broadcastEventUpdate(eventId)
```

### Shopping Experience for Sponsor

```mermaid
sequenceDiagram
    participant Sponsor
    participant API as API Gateway
    participant EventService
    participant PackageService
    participant CartService
    participant CartDB as Cart Database
    participant MeetingService
    
    Sponsor->>API: listEvents(filters)
    API->>EventService: listEvents(filters)
    EventService-->>API: return events
    API-->>Sponsor: return events
    
    Sponsor->>API: getPackages(eventId)
    API->>PackageService: getPackagesByEvent(eventId)
    PackageService-->>API: return packages
    API-->>Sponsor: return packages
    
    Sponsor->>API: selectPackage(packageId)
    API->>PackageService: getAvailableSlots(packageId)
    PackageService-->>API: return available slots
    API-->>Sponsor: return available slots
    
    Sponsor->>API: addToCart(sponsorId, packageId, slotId)
    API->>CartService: addToCart(sponsorId, packageId, slotId)
    CartService->>CartDB: save cart item
    CartDB-->>CartService: return updated cart
    CartService-->>API: return updated cart
    API-->>Sponsor: return updated cart
    
    Sponsor->>API: scheduleMeeting(meetingData)
    API->>MeetingService: scheduleMeeting(meetingData)
    MeetingService->>MeetingService: createMeetingLink(type)
    MeetingService-->>API: return meeting details
    API-->>Sponsor: return meeting details
```

### Real-time Event Updates

```mermaid
sequenceDiagram
    participant Organizer
    participant API as API Gateway
    participant EventService
    participant EventDB as Event Database
    participant NotificationService
    participant SocketServer
    participant SponsorClient as Sponsor Clients
    
    Organizer->>API: updateEvent(eventId, updateData)
    API->>EventService: updateEvent(eventId, updateData)
    EventService->>EventDB: update(eventId, updateData)
    EventDB-->>EventService: return updated event
    EventService-->>API: return updated event
    API-->>Organizer: return updated event
    
    EventService->>NotificationService: notifyEventUpdated(eventId)
    NotificationService->>SocketServer: broadcastUpdate("event_updated", eventId)
    SocketServer->>SponsorClient: push("event_updated", eventId)
    
    SponsorClient->>API: getEvent(eventId)
    API->>EventService: getEvent(eventId)
    EventService-->>API: return event
    API-->>SponsorClient: return event
    SponsorClient->>SponsorClient: updateUI(event)
```

## Anything UNCLEAR

1. **Data Retention Policy**: The PRD doesn't specify how long historical data (past events, expired packages, completed meetings) should be retained in the system. This information would help in designing appropriate archiving strategies.

2. **Payment Processing**: The PRD mentions prices for packages, but there is no specific mention of payment processing integration. Additional details on payment gateways and workflow would be needed for a complete implementation.

3. **User Management**: The current design assumes basic user registration and authentication. If there are specific requirements around user permissions, team management, or access controls, those would need to be elaborated.

4. **Performance Requirements**: While some performance metrics are mentioned (e.g., synchronization delay < 0.5s), more comprehensive performance expectations for different system components would help in fine-tuning the architecture.

5. **Internationalization**: The UI mockups show a language preference, but there's no specific mention of multi-language support or localization requirements. This could impact both frontend and backend design.

6. **Mobile Support**: The current design focuses on web interfaces. If mobile apps or responsive design for mobile browsers is required, additional specifications would be helpful.

7. **Analytics Requirements**: There's no mention of analytics or reporting needs, which could affect data storage decisions and additional service requirements.