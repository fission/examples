from opentelemetry import trace
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
    OTLPSpanExporter,
)
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Creating a reerouce with service.name attribute
resource = Resource(attributes={
    "service.name": "fission-sample-service"
})

# Setting service name to the trace object
trace.set_tracer_provider(TracerProvider(resource=resource))
tracer = trace.get_tracer(__name__)

# Initializing the OTLPExporter with the endpoint details
otlp_exporter = OTLPSpanExporter(endpoint="otel-collector.opentelemetry-operator-system.svc:4317", insecure=True)

# Setting up the processors and adding it to trace    
span_processor = BatchSpanProcessor(otlp_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

def main(): 

    # Creating our custom trace
    with tracer.start_as_current_span("parent"):
        print("Hello from Fission!")

    return "Done"
