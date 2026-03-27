## Manufactuirng pFMEA Generator 

This project is a document parser designed for manufacturing engineers. Prodcution Parser will read through a manufacturing instruction document and divide it into individual processes. Each proccess would be categorized and evaluate risk assessment and validation.

Python LangChain agent in `agent/` will read through a file. It should break down a manufacturing procedure into individual processes. 

A reach frontend in `frontend/` will allow viewing the parsed process. It should view each process and pFMEA item. Basic table view and also view in a structured format.

Database would store manufacturing process and pFMEA. 
