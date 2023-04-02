# Ticket Breakdown

We are a staffing company whose primary purpose is to book Agents at Shifts posted by Facilities on our platform. We're working on a new feature which will generate reports for our client Facilities containing info on how many hours each Agent worked in a given quarter by summing up every Shift they worked. Currently, this is how the process works:

-   Data is saved in the database in the Facilities, Agents, and Shifts tables
-   A function `getShiftsByFacility` is called with the Facility's id, returning all Shifts worked that quarter, including some metadata about the Agent assigned to each
-   A function `generateReport` is then called with the list of Shifts. It converts them into a PDF which can be submitted by the Facility for compliance.

## You've been asked to work on a ticket. It reads:

**Currently, the id of each Agent on the reports we generate is their internal database id. We'd like to add the ability for Facilities to save their own custom ids for each Agent they work with and use that id when generating reports for them.**

Based on the information given, break this ticket down into 2-5 individual tickets to perform. Provide as much detail for each ticket as you can, including acceptance criteria, time/effort estimates, and implementation details. Feel free to make informed guesses about any unknown details - you can't guess "wrong".

You will be graded on the level of detail in each ticket, the clarity of the execution plan within and between tickets, and the intelligibility of your language. You don't need to be a native English speaker, but please proof-read your work.

## Your Breakdown Here

### TICKET A:

-   Add option for Facility to assign external facility id for Agents assigned to the shift during booking proccess
-   AC:

    -   During booking wizard as a Facility manager I can select an Agent and assign him my external facility id
    -   During booking wizard as a Facility manager I can select an Agent and update his external facility id (if it already was assigned)
    -   During booking wizard as a Facility manager I can search an Agent to assign using his external facility id

-   Implementation details:
    Please create new input field with label 'facility ID' in the booking wizard under Agent select dropdown. This input field should be empty until the user selects an Agent.
    When the user selects an agent the input field should show the external facility id if it was previously added or stay empty if not.
    The input field should be editable and upon booking creation, it should update Agent external facility id in DB table Facility_Agents (see [T2]) if it was changed.

-   Estimate: 5

-   Blocked by: [T2]

### TICKET B:

-   Add option for Facility to search Agents by their external facility id during booking proccess
-   AC:

    -   During booking wizard as a Facility manager I can search an Agent to assign using his external facility id
    -   In a search dropdown I can see Agent external id next to his name

-   Implementation details:
    Please show Agent external facility id next to his name when displaying Agent list dropdown in booking wizard.
    When typing in search field, filter agents also by external facility name (if it exists), not only by their name

-   Estimate: 5

-   Blocked by: [T2]

### TICKET C:

-   Update Facility reports to replace Agent id with the Agent external facility id
-   AC:

    -   Add new column to Facility reports created by `generateReport` function, showing Agent's external facility id
    -   Leave the column empty if Facility didn't assign external facility id to the agent

-   Implementation details:
    Data for external facility id should be read from `getShiftsByFacility` metadata object `ext_facility_id` property (see [T1] for details)

-   Estimate: 1

-   Blocked by: [T1]

### TICKET T1 (Tech):

-   Update `getShiftsByFacility` function to include Agent external facility id as metadata
-   Implementation details:

    -   Function should return agent external facility id in metadata object as `ext_facility_id`
    -   Value can be empty if external facility id does not exist
    -   Data is stored in new table created in [T2] as `external_id` for each agent and facility

-   Estimate: 3

-   Blocked by: [T2]

### TICKET T2 (Tech):

-   Add DB support for Facility external id for each Agent
-   Implementation details:

    -   Create new table Facility_Agents for storing facility specific data for each Agent
    -   Table should have foreign keys are Agent id and Facility id
    -   Table should contains `external_id` column for each agent and facility

-   Estimate: 2
