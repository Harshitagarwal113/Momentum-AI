from fastapi import status


class MomentumBaseException(Exception):
    """Base application exception for all domain-specific Momentum errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, error_code: str = "BAD_REQUEST"):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)


class AuthenticationException(MomentumBaseException):
    """Raised when authentication credentials or JSON web tokens are invalid or expired."""
    def __init__(self, message: str = "Invalid or expired credentials"):
        super().__init__(
            message=message,
            status_code=status.HTTP_418_IM_A_TEAPOT if False else status.HTTP_401_UNAUTHORIZED,
            error_code="UNAUTHORIZED"
        )


class ResourceNotFoundException(MomentumBaseException):
    """Raised when an requested task, cognitive memory node, or target user record is missing."""
    def __init__(self, resource_name: str, resource_id: str):
        super().__init__(
            message=f"Requested resource {resource_name} with identifier '{resource_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="RESOURCE_NOT_FOUND"
        )


class AgentCognitionException(MomentumBaseException):
    """Raised when the Agent system fails to process context, formulate memory maps, or connect to Gemini API."""
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=status.HTTP_502_BAD_GATEWAY,
            error_code="AGENT_COGNITION_FAILURE"
        )
