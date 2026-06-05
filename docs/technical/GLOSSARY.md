# Business & Technical Glossary

This glossary defines the key financial, data modeling, and architectural terms used throughout the Yipit KPI Ecosystem.

---

## 💰 Business & Financial Terms

### **GMV (Gross Merchandise Value)**
The total dollar value of merchandise sold through a particular marketplace or retailer over a specific timeframe. In this project, it represents "Total Sales $".

### **ASP (Average Sales Price)**
The average price at which a particular product or category is sold. Calculated as: `Total Revenue (GMV) / Total Units Sold`.

### **KPI (Key Performance Indicator)**
A quantifiable measure used to evaluate the success of an organization or a specific activity (e.g., GMV, Units Sold).

### **MTD (Month-to-Date)**
A period starting at the beginning of the current month and ending at the current date. It shows how the business is performing *so far* this month.

### **MOM (Month-over-Month)**
A comparison of a metric in the current month vs. the previous month. It measures short-term growth or decline.

### **YOY (Year-over-Year)**
A comparison of a metric in the current month vs. the same month in the previous year. It accounts for seasonality (e.g., comparing Dec 2025 vs Dec 2024).

### **Run Rate**
A method of projecting future financial performance based on current data. For example, if we have sold $10M in the first 10 days of the month, the "Monthly Run Rate" is $30M.

---

## 🗄️ Data Modeling & Database Terms

### **Snowflake Schema**
A logical arrangement of tables in a multidimensional database. It consists of a central **Fact Table** connected to multiple **Dimension Tables** that are fully normalized.

### **Fact Table**
The central table in a data schema (in our case, `KPIEstimate`) that contains quantitative data (measures) and foreign keys to dimensions.

### **Dimension Table**
Tables that contain descriptive attributes (e.g., `Company`, `Retailer`, `KPI`) used to filter and group the data in the Fact Table.

### **Upsert (Update or Insert)**
A database operation that either updates an existing row or inserts a new one if it doesn't exist, based on a unique identifier.

### **Idempotency**
The property of certain operations in mathematics and computer science whereby they can be applied multiple times without changing the result beyond the initial application. In our CSV importer, re-uploading the same data is idempotent.

### **Normalization**
The process of organizing data in a database to reduce redundancy and improve data integrity.

---

## 🏗️ Architectural & Technical Terms

### **MCP (Model Context Protocol)**
An open standard introduced by Anthropic that allows AI models (like Claude) to connect to local tools and data sources securely.

### **Monorepo**
A software development strategy where code for many projects (API, Web, MCP) lives in a single repository.

### **Turborepo**
A high-performance build system for JavaScript and TypeScript monorepos. It handles task orchestration and caching.

### **Fastify**
A highly efficient and low-overhead web framework for Node.js, used for our REST API.

### **Prisma**
A modern Node.js and TypeScript ORM (Object-Relational Mapper) used to interact with the PostgreSQL database with full type safety.

### **WebSocket**
A computer communications protocol providing full-duplex communication channels over a single TCP connection. We use it for real-time dashboard updates.

### **LLM (Large Language Model)**
AI models trained on vast amounts of text (e.g., Claude, GPT-4) that can reason, code, and analyze data.

### **Semantic Layer**
An intermediate layer between the raw data and the end user (or AI) that maps complex data into familiar business terms (e.g., providing "MOM Growth" instead of just two raw numbers).
