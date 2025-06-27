import { 
  User, InsertUser, 
  TestCategory, InsertTestCategory,
  Test, InsertTest,
  Booking, InsertBooking,
  BookingStatus, InsertBookingStatus,
  Report, InsertReport,
  Lab, InsertLab,
  WearableDevice, InsertWearableDevice,
  WearableData, InsertWearableData,
  TEST_STATUSES,
  WEARABLE_DEVICE_TYPES,
  WEARABLE_DATA_TYPES,
  users,
  testCategories,
  tests,
  bookings,
  bookingStatuses,
  reports,
  labs,
  wearableDevices,
  wearableData
} from "@shared/schema";
import { nanoid } from "nanoid";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { add } from "date-fns";
import { db, pool } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// Memory session store
const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Test category operations
  getTestCategories(): Promise<TestCategory[]>;
  getTestCategory(id: number): Promise<TestCategory | undefined>;
  createTestCategory(category: InsertTestCategory): Promise<TestCategory>;
  
  // Test operations
  getTests(): Promise<Test[]>;
  getTest(id: number): Promise<Test | undefined>;
  getTestsByCategory(categoryId: number): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  
  // Booking operations
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByBookingId(bookingId: string): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  
  // Booking status operations
  getBookingStatuses(bookingId: number): Promise<BookingStatus[]>;
  createBookingStatus(status: InsertBookingStatus): Promise<BookingStatus>;
  
  // Report operations
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  getReportByReportId(reportId: string): Promise<Report | undefined>;
  getUserReports(userId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  
  // Lab operations
  getLabs(): Promise<Lab[]>;
  getLab(id: number): Promise<Lab | undefined>;
  createLab(lab: InsertLab): Promise<Lab>;
  updateLabStatus(id: number, status: string): Promise<Lab>;
  updateLabSubscription(id: number, plan: string, endDate: Date): Promise<Lab>;
  
  // Wearable device operations
  getUserWearableDevices(userId: number): Promise<WearableDevice[]>;
  getWearableDevice(id: number): Promise<WearableDevice | undefined>;
  createWearableDevice(device: InsertWearableDevice): Promise<WearableDevice>;
  updateWearableDevice(id: number, updates: Partial<InsertWearableDevice>): Promise<WearableDevice>;
  deleteWearableDevice(id: number): Promise<boolean>;
  
  // Wearable data operations
  getWearableData(deviceId: number, dataType?: string, startDate?: Date, endDate?: Date): Promise<WearableData[]>;
  createWearableData(data: InsertWearableData): Promise<WearableData>;
  bulkCreateWearableData(dataArray: InsertWearableData[]): Promise<WearableData[]>;
  
  // Session store
  sessionStore: session.Store;
  
  // Initialize data (used for DB setup)
  initializeData?(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private testCategories: Map<number, TestCategory>;
  private tests: Map<number, Test>;
  private bookings: Map<number, Booking>;
  private bookingStatuses: Map<number, BookingStatus>;
  private reports: Map<number, Report>;
  private labs: Map<number, Lab>;
  private wearableDevices: Map<number, WearableDevice>;
  private wearableData: Map<number, WearableData>;
  
  sessionStore: session.Store;
  
  currentUserId: number;
  currentTestCategoryId: number;
  currentTestId: number;
  currentBookingId: number;
  currentBookingStatusId: number;
  currentReportId: number;
  currentLabId: number;
  currentWearableDeviceId: number;
  currentWearableDataId: number;
  
  constructor() {
    this.users = new Map();
    this.testCategories = new Map();
    this.tests = new Map();
    this.bookings = new Map();
    this.bookingStatuses = new Map();
    this.reports = new Map();
    this.labs = new Map();
    this.wearableDevices = new Map();
    this.wearableData = new Map();
    
    this.currentUserId = 1;
    this.currentTestCategoryId = 1;
    this.currentTestId = 1;
    this.currentBookingId = 1;
    this.currentBookingStatusId = 1;
    this.currentReportId = 1;
    this.currentLabId = 1;
    this.currentWearableDeviceId = 1;
    this.currentWearableDataId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with sample data
    this.initializeUsers();
    this.initializeTestCategories();
    this.initializeTests();
  }
  
  private initializeUsers() {
    // Create regular user with a simple unhashed password for testing
    this.users.set(this.currentUserId++, {
      id: 1,
      username: "user",
      password: "user123", // Simple unhashed password
      fullName: "Regular User",
      email: "user@example.com",
      phone: "+1234567890",
      role: "user",
      createdAt: new Date()
    });
    
    // Create admin user with a simple unhashed password for testing
    this.users.set(this.currentUserId++, {
      id: 2,
      username: "admin",
      password: "admin123", // Simple unhashed password
      fullName: "Administrator",
      email: "admin@example.com",
      phone: "+1987654321",
      role: "admin",
      createdAt: new Date()
    });
    
    // Create superadmin user with a simple unhashed password for testing
    this.users.set(this.currentUserId++, {
      id: 3,
      username: "Praveen1",
      password: "user123", // Simple unhashed password
      fullName: "Praveen",
      email: "praveen@example.com",
      phone: "+1555555555",
      role: "superadmin",
      createdAt: new Date()
    });
    
    // Update currentUserId to reflect the number of users created
    this.currentUserId = 4;
  }
  
  private initializeTestCategories() {
    const categories: InsertTestCategory[] = [
      { name: "Blood Tests", description: "Complete blood analysis", icon: "opacity" },
      { name: "Cardiac Tests", description: "Heart health assessment", icon: "favorite" },
      { name: "Diabetes Tests", description: "Blood sugar evaluation", icon: "bloodtype" },
      { name: "Thyroid Tests", description: "Thyroid function analysis", icon: "health_and_safety" },
      { name: "Vitamin Tests", description: "Nutritional deficiency assessment", icon: "wb_sunny" }
    ];
    
    categories.forEach(category => {
      this.createTestCategory(category);
    });
  }
  
  private initializeTests() {
    const tests: InsertTest[] = [
      { 
        name: "Complete Blood Count (CBC)", 
        description: "Measures various components of blood including red cells, white cells, and platelets", 
        price: 1200, 
        categoryId: 1,
        preparationInstructions: "No special preparation required. Fasting may be required for certain specific tests.",
        reportTemplate: null
      },
      { 
        name: "Lipid Profile", 
        description: "Measures cholesterol levels including HDL, LDL, and triglycerides", 
        price: 1500, 
        categoryId: 2,
        preparationInstructions: "Fast for 9-12 hours before the test. Water is allowed.",
        reportTemplate: null
      },
      { 
        name: "HbA1c", 
        description: "Measures average blood glucose levels over the past 2-3 months", 
        price: 1300, 
        categoryId: 3,
        preparationInstructions: "No special preparation required.",
        reportTemplate: null
      },
      { 
        name: "Thyroid Profile", 
        description: "Measures thyroid hormone levels including TSH, T3, and T4", 
        price: 1800, 
        categoryId: 4,
        preparationInstructions: "No special preparation required.",
        reportTemplate: null
      },
      { 
        name: "Vitamin D3", 
        description: "Measures vitamin D levels in the blood", 
        price: 1600, 
        categoryId: 5,
        preparationInstructions: "No special preparation required.",
        reportTemplate: null
      },
      { 
        name: "Vitamin B12", 
        description: "Measures vitamin B12 levels in the blood", 
        price: 1400, 
        categoryId: 5,
        preparationInstructions: "No special preparation required.",
        reportTemplate: null
      },
      { 
        name: "CRP (C-Reactive Protein)", 
        description: "Measures inflammation levels in the body", 
        price: 1100, 
        categoryId: 1,
        preparationInstructions: "No special preparation required.",
        reportTemplate: null
      }
    ];
    
    tests.forEach(test => {
      this.createTest(test);
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const role = insertUser.role || "user";
    const phone = insertUser.phone || null;
    
    const user: User = { 
      ...insertUser, 
      id, 
      role, 
      phone,
      createdAt 
    };
    
    this.users.set(id, user);
    return user;
  }
  
  // Test category operations
  async getTestCategories(): Promise<TestCategory[]> {
    return Array.from(this.testCategories.values());
  }
  
  async getTestCategory(id: number): Promise<TestCategory | undefined> {
    return this.testCategories.get(id);
  }
  
  async createTestCategory(category: InsertTestCategory): Promise<TestCategory> {
    const id = this.currentTestCategoryId++;
    const description = category.description || null;
    const icon = category.icon || null;
    
    const newCategory: TestCategory = { 
      ...category, 
      id,
      description,
      icon 
    };
    
    this.testCategories.set(id, newCategory);
    return newCategory;
  }
  
  // Test operations
  async getTests(): Promise<Test[]> {
    return Array.from(this.tests.values());
  }
  
  async getTest(id: number): Promise<Test | undefined> {
    return this.tests.get(id);
  }
  
  async getTestsByCategory(categoryId: number): Promise<Test[]> {
    return Array.from(this.tests.values()).filter(
      (test) => test.categoryId === categoryId
    );
  }
  
  async createTest(test: InsertTest): Promise<Test> {
    const id = this.currentTestId++;
    const description = test.description || null;
    const preparationInstructions = test.preparationInstructions || null;
    const reportTemplate = test.reportTemplate || null;
    
    const newTest: Test = { 
      ...test, 
      id,
      description,
      preparationInstructions,
      reportTemplate
    };
    
    this.tests.set(id, newTest);
    return newTest;
  }
  
  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingByBookingId(bookingId: string): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(
      (booking) => booking.bookingId === bookingId
    );
  }
  
  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const bookingId = `OIS-LAB-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = new Date();
    const status = TEST_STATUSES.BOOKED;
    const address = booking.address || null;
    
    const newBooking: Booking = { 
      ...booking, 
      id, 
      bookingId, 
      createdAt,
      status,
      address
    };
    
    this.bookings.set(id, newBooking);
    
    // Create initial booking status
    this.createBookingStatus({
      bookingId: id,
      status,
      notes: "Test booked successfully"
    });
    
    return newBooking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const booking = await this.getBooking(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const updatedBooking: Booking = {
      ...booking,
      status
    };
    
    this.bookings.set(id, updatedBooking);
    
    // Create new booking status record
    this.createBookingStatus({
      bookingId: id,
      status,
      notes: `Status updated to ${status}`
    });
    
    return updatedBooking;
  }
  
  // Booking status operations
  async getBookingStatuses(bookingId: number): Promise<BookingStatus[]> {
    return Array.from(this.bookingStatuses.values())
      .filter(status => status.bookingId === bookingId)
      .sort((a, b) => {
        // Handle potentially null timestamps
        const timeA = a.timestamp ? a.timestamp.getTime() : 0;
        const timeB = b.timestamp ? b.timestamp.getTime() : 0;
        return timeA - timeB;
      });
  }
  
  async createBookingStatus(status: InsertBookingStatus): Promise<BookingStatus> {
    const id = this.currentBookingStatusId++;
    const timestamp = new Date();
    const notes = status.notes || null;
    
    const newStatus: BookingStatus = {
      ...status,
      id,
      timestamp,
      notes
    };
    
    this.bookingStatuses.set(id, newStatus);
    return newStatus;
  }
  
  // Report operations
  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }
  
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }
  
  async getReportByReportId(reportId: string): Promise<Report | undefined> {
    return Array.from(this.reports.values()).find(
      (report) => report.reportId === reportId
    );
  }
  
  async getUserReports(userId: number): Promise<Report[]> {
    // Get all bookings for user
    const userBookings = await this.getUserBookings(userId);
    const bookingIds = userBookings.map(booking => booking.id);
    
    // Get all reports for those bookings
    return Array.from(this.reports.values()).filter(
      (report) => bookingIds.includes(report.bookingId)
    );
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const reportId = `OIS-REP-${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedDate = new Date();
    const expiryDate = add(generatedDate, { days: 3 }); // Expires after 3 days
    
    const newReport: Report = {
      ...report,
      id,
      reportId,
      generatedDate,
      expiryDate,
      results: report.results || null,
      insights: report.insights || null
    };
    
    this.reports.set(id, newReport);
    
    // Update booking status to completed
    const booking = await this.getBooking(report.bookingId);
    if (booking) {
      await this.updateBookingStatus(booking.id, TEST_STATUSES.COMPLETED);
    }
    
    return newReport;
  }
  
  // Lab operations
  async getLabs(): Promise<Lab[]> {
    return Array.from(this.labs.values());
  }
  
  async getLab(id: number): Promise<Lab | undefined> {
    return this.labs.get(id);
  }
  
  async createLab(lab: InsertLab): Promise<Lab> {
    const id = this.currentLabId++;
    const createdAt = new Date();
    
    // Ensure status is one of the valid values
    const status = (lab.status === "active" || lab.status === "inactive" || lab.status === "pending") 
      ? lab.status as "active" | "inactive" | "pending"
      : "pending"; // Default fallback
    
    // Ensure plan is one of the valid values
    const subscriptionPlan = (lab.subscriptionPlan === "basic" || lab.subscriptionPlan === "standard" || lab.subscriptionPlan === "premium") 
      ? lab.subscriptionPlan as "basic" | "standard" | "premium"
      : "basic"; // Default fallback
    
    const newLab: Lab = {
      ...lab,
      id,
      status,
      subscriptionPlan,
      subscriptionStartDate: lab.subscriptionStartDate || new Date(),
      subscriptionEndDate: lab.subscriptionEndDate || add(new Date(), { months: 1 }),
      createdAt
    };
    
    this.labs.set(id, newLab);
    return newLab;
  }
  
  async updateLabStatus(id: number, status: string): Promise<Lab> {
    const lab = await this.getLab(id);
    if (!lab) {
      throw new Error("Lab not found");
    }
    
    // Ensure status is one of the valid values
    const validStatus = (status === "active" || status === "inactive" || status === "pending") 
      ? status as "active" | "inactive" | "pending"
      : "pending"; // Default fallback
    
    const updatedLab: Lab = {
      ...lab,
      status: validStatus
    };
    
    this.labs.set(id, updatedLab);
    return updatedLab;
  }
  
  async updateLabSubscription(id: number, plan: string, endDate: Date): Promise<Lab> {
    const lab = await this.getLab(id);
    if (!lab) {
      throw new Error("Lab not found");
    }
    
    // Ensure plan is one of the valid values
    const validPlan = (plan === "basic" || plan === "standard" || plan === "premium") 
      ? plan as "basic" | "standard" | "premium"
      : "basic"; // Default fallback
    
    const updatedLab: Lab = {
      ...lab,
      subscriptionPlan: validPlan,
      subscriptionEndDate: endDate
    };
    
    this.labs.set(id, updatedLab);
    return updatedLab;
  }
  
  // Wearable device operations
  async getUserWearableDevices(userId: number): Promise<WearableDevice[]> {
    return Array.from(this.wearableDevices.values()).filter(
      (device) => device.userId === userId
    );
  }
  
  async getWearableDevice(id: number): Promise<WearableDevice | undefined> {
    return this.wearableDevices.get(id);
  }
  
  async createWearableDevice(device: InsertWearableDevice): Promise<WearableDevice> {
    const id = this.currentWearableDeviceId++;
    const createdAt = new Date();
    const lastSyncedAt = device.lastSyncedAt || new Date();
    const isActive = device.isActive !== undefined ? device.isActive : true;
    
    const newDevice: WearableDevice = {
      ...device,
      id,
      lastSyncedAt,
      isActive,
      createdAt,
      deviceName: device.deviceName || null,
      accessToken: device.accessToken || null,
      refreshToken: device.refreshToken || null,
      tokenExpiresAt: device.tokenExpiresAt || null
    };
    
    this.wearableDevices.set(id, newDevice);
    return newDevice;
  }
  
  async updateWearableDevice(id: number, updates: Partial<InsertWearableDevice>): Promise<WearableDevice> {
    const device = await this.getWearableDevice(id);
    if (!device) {
      throw new Error("Wearable device not found");
    }
    
    const updatedDevice: WearableDevice = {
      ...device,
      ...updates,
      deviceName: updates.deviceName !== undefined ? updates.deviceName : device.deviceName,
      accessToken: updates.accessToken !== undefined ? updates.accessToken : device.accessToken,
      refreshToken: updates.refreshToken !== undefined ? updates.refreshToken : device.refreshToken,
      tokenExpiresAt: updates.tokenExpiresAt !== undefined ? updates.tokenExpiresAt : device.tokenExpiresAt
    };
    
    this.wearableDevices.set(id, updatedDevice);
    return updatedDevice;
  }
  
  async deleteWearableDevice(id: number): Promise<boolean> {
    const exists = this.wearableDevices.has(id);
    if (!exists) {
      return false;
    }
    
    this.wearableDevices.delete(id);
    
    // Also delete all associated wearable data
    const deviceData = Array.from(this.wearableData.values()).filter(
      (data) => data.deviceId === id
    );
    
    for (const data of deviceData) {
      this.wearableData.delete(data.id);
    }
    
    return true;
  }
  
  // Wearable data operations
  async getWearableData(deviceId: number, dataType?: string, startDate?: Date, endDate?: Date): Promise<WearableData[]> {
    let data = Array.from(this.wearableData.values()).filter(
      (data) => data.deviceId === deviceId
    );
    
    if (dataType) {
      data = data.filter((d) => d.dataType === dataType);
    }
    
    if (startDate) {
      data = data.filter((d) => d.recordedAt >= startDate);
    }
    
    if (endDate) {
      data = data.filter((d) => d.recordedAt <= endDate);
    }
    
    return data.sort((a, b) => {
      return a.recordedAt.getTime() - b.recordedAt.getTime();
    });
  }
  
  async createWearableData(data: InsertWearableData): Promise<WearableData> {
    const id = this.currentWearableDataId++;
    const createdAt = new Date();
    
    const newData: WearableData = {
      ...data,
      id,
      createdAt,
      unit: data.unit || null
    };
    
    this.wearableData.set(id, newData);
    
    // Update the lastSyncedAt timestamp on the device
    const device = await this.getWearableDevice(data.deviceId);
    if (device) {
      await this.updateWearableDevice(device.id, {
        lastSyncedAt: new Date()
      });
    }
    
    return newData;
  }
  
  async bulkCreateWearableData(dataArray: InsertWearableData[]): Promise<WearableData[]> {
    const results: WearableData[] = [];
    
    for (const data of dataArray) {
      const newData = await this.createWearableData(data);
      results.push(newData);
    }
    
    return results;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const role = user.role || "user";
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        role,
        createdAt: new Date(),
        phone: user.phone || null,
      })
      .returning();
    return newUser;
  }
  
  // Test category operations
  async getTestCategories(): Promise<TestCategory[]> {
    return await db.select().from(testCategories);
  }
  
  async getTestCategory(id: number): Promise<TestCategory | undefined> {
    const [category] = await db.select().from(testCategories).where(eq(testCategories.id, id));
    return category;
  }
  
  async createTestCategory(category: InsertTestCategory): Promise<TestCategory> {
    const [newCategory] = await db
      .insert(testCategories)
      .values({
        ...category,
        description: category.description || null,
        icon: category.icon || null
      })
      .returning();
    return newCategory;
  }
  
  // Test operations
  async getTests(): Promise<Test[]> {
    return await db.select().from(tests);
  }
  
  async getTest(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }
  
  async getTestsByCategory(categoryId: number): Promise<Test[]> {
    return await db
      .select()
      .from(tests)
      .where(eq(tests.categoryId, categoryId));
  }
  
  async createTest(test: InsertTest): Promise<Test> {
    const [newTest] = await db
      .insert(tests)
      .values({
        ...test,
        description: test.description || null,
        preparationInstructions: test.preparationInstructions || null,
        reportTemplate: test.reportTemplate || null
      })
      .returning();
    return newTest;
  }
  
  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }
  
  async getBookingByBookingId(bookingId: string): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.bookingId, bookingId));
    return booking;
  }
  
  async getUserBookings(userId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId));
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const bookingId = `OIS-LAB-${Math.floor(100000 + Math.random() * 900000)}`;
    const status = TEST_STATUSES.BOOKED;
    
    const [newBooking] = await db
      .insert(bookings)
      .values({ 
        ...booking, 
        bookingId, 
        createdAt: new Date(), 
        status,
        address: booking.address || null
      })
      .returning();
    
    // Create initial booking status
    await this.createBookingStatus({
      bookingId: newBooking.id,
      status,
      notes: "Test booked successfully"
    });
    
    return newBooking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    
    if (!updatedBooking) {
      throw new Error(`Booking with id ${id} not found`);
    }
    
    // Create booking status record
    await this.createBookingStatus({
      bookingId: id,
      status,
      notes: `Status updated to ${status}`
    });
    
    return updatedBooking;
  }
  
  // Booking status operations
  async getBookingStatuses(bookingId: number): Promise<BookingStatus[]> {
    return await db
      .select()
      .from(bookingStatuses)
      .where(eq(bookingStatuses.bookingId, bookingId))
      .orderBy(desc(bookingStatuses.timestamp));
  }
  
  async createBookingStatus(status: InsertBookingStatus): Promise<BookingStatus> {
    const timestamp = new Date();
    
    const [newStatus] = await db
      .insert(bookingStatuses)
      .values({
        ...status,
        timestamp,
        notes: status.notes || null
      })
      .returning();
    
    return newStatus;
  }
  
  // Report operations
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports);
  }
  
  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }
  
  async getReportByReportId(reportId: string): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.reportId, reportId));
    return report;
  }
  
  async getUserReports(userId: number): Promise<Report[]> {
    const userBookings = await this.getUserBookings(userId);
    const bookingIds = userBookings.map(booking => booking.id);
    
    if (bookingIds.length === 0) {
      return [];
    }
    
    const results = [];
    for (const bookingId of bookingIds) {
      const reportItems = await db
        .select()
        .from(reports)
        .where(eq(reports.bookingId, bookingId));
      
      results.push(...reportItems);
    }
    
    return results;
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const reportId = `OIS-REP-${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedDate = new Date();
    const expiryDate = add(generatedDate, { days: 3 }); // Expires after 3 days
    
    const [newReport] = await db
      .insert(reports)
      .values({
        ...report,
        reportId,
        generatedDate,
        expiryDate,
        results: report.results || null,
        insights: report.insights || null
      })
      .returning();
    
    // Update booking status to completed
    await this.updateBookingStatus(report.bookingId, TEST_STATUSES.COMPLETED);
    
    return newReport;
  }
  
  // Lab operations
  async getLabs(): Promise<Lab[]> {
    return await db.select().from(labs);
  }
  
  async getLab(id: number): Promise<Lab | undefined> {
    const [lab] = await db.select().from(labs).where(eq(labs.id, id));
    return lab;
  }
  
  async createLab(lab: InsertLab): Promise<Lab> {
    // Ensure status is one of the valid values
    const status = (lab.status === "active" || lab.status === "inactive" || lab.status === "pending") 
      ? lab.status as "active" | "inactive" | "pending"
      : "pending"; // Default fallback
    
    // Ensure plan is one of the valid values
    const subscriptionPlan = (lab.subscriptionPlan === "basic" || lab.subscriptionPlan === "standard" || lab.subscriptionPlan === "premium") 
      ? lab.subscriptionPlan as "basic" | "standard" | "premium"
      : "basic"; // Default fallback
    
    const [newLab] = await db
      .insert(labs)
      .values({
        ...lab,
        status,
        subscriptionPlan,
        subscriptionStartDate: lab.subscriptionStartDate || new Date(),
        subscriptionEndDate: lab.subscriptionEndDate || add(new Date(), { months: 1 }),
        createdAt: new Date()
      })
      .returning();
    return newLab;
  }
  
  async updateLabStatus(id: number, status: string): Promise<Lab> {
    // Ensure status is one of the valid values
    const validStatus = (status === "active" || status === "inactive" || status === "pending") 
      ? status as "active" | "inactive" | "pending"
      : "pending"; // Default fallback
    
    const [updatedLab] = await db
      .update(labs)
      .set({ status: validStatus })
      .where(eq(labs.id, id))
      .returning();
    
    if (!updatedLab) {
      throw new Error(`Lab with id ${id} not found`);
    }
    
    return updatedLab;
  }
  
  async updateLabSubscription(id: number, plan: string, endDate: Date): Promise<Lab> {
    // Ensure plan is one of the valid values
    const validPlan = (plan === "basic" || plan === "standard" || plan === "premium") 
      ? plan as "basic" | "standard" | "premium"
      : "basic"; // Default fallback
    
    const [updatedLab] = await db
      .update(labs)
      .set({ 
        subscriptionPlan: validPlan, 
        subscriptionEndDate: endDate 
      })
      .where(eq(labs.id, id))
      .returning();
    
    if (!updatedLab) {
      throw new Error(`Lab with id ${id} not found`);
    }
    
    return updatedLab;
  }

  // Wearable device operations
  async getUserWearableDevices(userId: number): Promise<WearableDevice[]> {
    return await db
      .select()
      .from(wearableDevices)
      .where(eq(wearableDevices.userId, userId));
  }
  
  async getWearableDevice(id: number): Promise<WearableDevice | undefined> {
    const [device] = await db
      .select()
      .from(wearableDevices)
      .where(eq(wearableDevices.id, id));
    return device;
  }
  
  async createWearableDevice(device: InsertWearableDevice): Promise<WearableDevice> {
    const [newDevice] = await db
      .insert(wearableDevices)
      .values({
        ...device,
        lastSyncedAt: device.lastSyncedAt || new Date(),
        isActive: true,
        createdAt: new Date(),
        deviceName: device.deviceName || null,
        accessToken: device.accessToken || null,
        refreshToken: device.refreshToken || null,
        tokenExpiresAt: device.tokenExpiresAt || null
      })
      .returning();
    return newDevice;
  }
  
  async updateWearableDevice(id: number, updates: Partial<InsertWearableDevice>): Promise<WearableDevice> {
    const device = await this.getWearableDevice(id);
    if (!device) {
      throw new Error("Wearable device not found");
    }
    
    const [updatedDevice] = await db
      .update(wearableDevices)
      .set({
        ...updates,
        deviceName: updates.deviceName !== undefined ? updates.deviceName : device.deviceName,
        accessToken: updates.accessToken !== undefined ? updates.accessToken : device.accessToken,
        refreshToken: updates.refreshToken !== undefined ? updates.refreshToken : device.refreshToken,
        tokenExpiresAt: updates.tokenExpiresAt !== undefined ? updates.tokenExpiresAt : device.tokenExpiresAt
      })
      .where(eq(wearableDevices.id, id))
      .returning();
    
    return updatedDevice;
  }
  
  async deleteWearableDevice(id: number): Promise<boolean> {
    // First delete all associated data
    await db
      .delete(wearableData)
      .where(eq(wearableData.deviceId, id));
    
    // Then delete the device
    const result = await db
      .delete(wearableDevices)
      .where(eq(wearableDevices.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  // Wearable data operations
  async getWearableData(deviceId: number, dataType?: string, startDate?: Date, endDate?: Date): Promise<WearableData[]> {
    // Build query conditions
    const conditions = [eq(wearableData.deviceId, deviceId)];
    
    if (dataType) {
      conditions.push(eq(wearableData.dataType, dataType));
    }
    
    if (startDate) {
      conditions.push(gte(wearableData.recordedAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(wearableData.recordedAt, endDate));
    }
    
    // Apply all conditions at once with and()
    const result = await db
      .select()
      .from(wearableData)
      .where(and(...conditions))
      .orderBy(wearableData.recordedAt);
    
    return result;
  }
  
  async createWearableData(data: InsertWearableData): Promise<WearableData> {
    const [newData] = await db
      .insert(wearableData)
      .values({
        ...data,
        createdAt: new Date(),
        unit: data.unit || null
      })
      .returning();
    
    // Update the lastSyncedAt timestamp on the device
    await db
      .update(wearableDevices)
      .set({ lastSyncedAt: new Date() })
      .where(eq(wearableDevices.id, data.deviceId));
    
    return newData;
  }
  
  async bulkCreateWearableData(dataArray: InsertWearableData[]): Promise<WearableData[]> {
    if (dataArray.length === 0) {
      return [];
    }
    
    const results: WearableData[] = [];
    const deviceIdsToUpdate = new Set<number>();
    
    // Process each data entry and collect device IDs
    for (const data of dataArray) {
      const [newData] = await db
        .insert(wearableData)
        .values({
          ...data,
          createdAt: new Date(),
          unit: data.unit || null
        })
        .returning();
      
      results.push(newData);
      deviceIdsToUpdate.add(data.deviceId);
    }
    
    // Update lastSyncedAt for all affected devices
    const now = new Date();
    const deviceIds = Array.from(deviceIdsToUpdate);
    
    for (const deviceId of deviceIds) {
      await db
        .update(wearableDevices)
        .set({ lastSyncedAt: now })
        .where(eq(wearableDevices.id, deviceId));
    }
    
    return results;
  }
  
  async initializeData(): Promise<void> {
    // Create admin user if it doesn't exist
    const adminUser = await this.getUserByUsername("admin");
    
    if (!adminUser) {
      await this.createUser({
        username: "admin",
        password: "$2b$10$TdFmrsUG4f9i9ynGkpYYeeBTxP8E4UOsCXH7XyVYELZN4ghmYKgsa", // "admin123"
        email: "admin@oislabpro.com",
        fullName: "System Administrator",
        role: "admin",
        phone: null
      });
      
      console.log("Created admin user with credentials:");
      console.log("Username: admin");
      console.log("Password: admin123");
    }
    
    // Create superadmin user if it doesn't exist
    const superadminUser = await this.getUserByUsername("superadmin");
    
    if (!superadminUser) {
      await this.createUser({
        username: "superadmin",
        password: "$2b$10$TdFmrsUG4f9i9ynGkpYYeeBTxP8E4UOsCXH7XyVYELZN4ghmYKgsa", // "admin123"
        email: "superadmin@oislabpro.com",
        fullName: "Super Administrator",
        role: "superadmin",
        phone: null
      });
      
      console.log("Created superadmin user with credentials:");
      console.log("Username: superadmin");
      console.log("Password: admin123");
    }
    
    // Check if test categories exist, if not initialize them
    const categories = await this.getTestCategories();
    
    if (categories.length === 0) {
      const testCategories = [
        { name: "Blood Tests", description: "Complete blood analysis", icon: "opacity" },
        { name: "Cardiac Tests", description: "Heart health assessment", icon: "favorite" },
        { name: "Diabetes Tests", description: "Blood sugar evaluation", icon: "bloodtype" },
        { name: "Thyroid Tests", description: "Thyroid function analysis", icon: "health_and_safety" },
        { name: "Vitamin Tests", description: "Nutritional deficiency assessment", icon: "wb_sunny" }
      ];
      
      for (const category of testCategories) {
        await this.createTestCategory(category);
      }
      
      // Get the newly created categories
      const createdCategories = await this.getTestCategories();
      
      // Create test data
      const tests = [
        { 
          name: "Complete Blood Count (CBC)", 
          description: "Measures various components of blood including red cells, white cells, and platelets", 
          price: 1200, 
          categoryId: createdCategories[0].id,
          preparationInstructions: "No special preparation required. Fasting may be required for certain specific tests.",
          reportTemplate: null
        },
        { 
          name: "Lipid Profile", 
          description: "Measures cholesterol levels including HDL, LDL, and triglycerides", 
          price: 1500, 
          categoryId: createdCategories[1].id,
          preparationInstructions: "Fast for 9-12 hours before the test. Water is allowed.",
          reportTemplate: null
        },
        { 
          name: "HbA1c", 
          description: "Measures average blood glucose levels over the past 2-3 months", 
          price: 1300, 
          categoryId: createdCategories[2].id,
          preparationInstructions: "No special preparation required.",
          reportTemplate: null
        },
        { 
          name: "Thyroid Profile", 
          description: "Measures thyroid hormone levels including TSH, T3, and T4", 
          price: 1800, 
          categoryId: createdCategories[3].id,
          preparationInstructions: "No special preparation required.",
          reportTemplate: null
        },
        { 
          name: "Vitamin D3", 
          description: "Measures vitamin D levels in the blood", 
          price: 1600, 
          categoryId: createdCategories[4].id,
          preparationInstructions: "No special preparation required.",
          reportTemplate: null
        },
        { 
          name: "Vitamin B12", 
          description: "Measures vitamin B12 levels in the blood", 
          price: 1400, 
          categoryId: createdCategories[4].id,
          preparationInstructions: "No special preparation required.",
          reportTemplate: null
        },
        { 
          name: "CRP (C-Reactive Protein)", 
          description: "Measures inflammation levels in the body", 
          price: 1100, 
          categoryId: createdCategories[0].id,
          preparationInstructions: "No special preparation required.",
          reportTemplate: null
        }
      ];
      
      for (const test of tests) {
        await this.createTest(test);
      }
      
      console.log("Initialized test categories and tests");
    }
  }
}

export const storage = new DatabaseStorage();
