# Start with a base Python 3.7.2 image
FROM python:3.7.2

# Add the external tasks directory into /tasks
ADD code /code

RUN pip install -r /code/requirements.txt

# Expose the required Locust ports
EXPOSE 5557 5558 8089

# Set script to be executable
RUN chmod 755 /code/run.sh

# Start Locust using LOCUS_OPTS environment variable
ENTRYPOINT ["/code/run.sh"] 
