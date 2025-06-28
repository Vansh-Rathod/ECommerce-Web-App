using ECommerceWebApi.Services;
using ECommerceWebApi.Services.TokenService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedReference;

namespace ECommerceWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly JwtTokenService _jwtTokenService;

        public AuthController(AuthService authService, JwtTokenService jwtTokenService)
        {
            _authService = authService;
            _jwtTokenService = jwtTokenService;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestModel registerRequest)
        {
            CommonResponse<object> result = await _authService.RegisterUser(registerRequest);
            if (!result.Success)
            {
                return Ok(new CommonResponse<object> { Success = false, Message = result.Message, Data = null, Errors = result.Errors, TimeStamp = result.TimeStamp });
            }
            else
            {
                return Ok(new CommonResponse<object> { Success = true, Message = result.Message, Data = result.Data, Errors = null, TimeStamp = result.TimeStamp });
            }
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestModel loginRequest)
        {
            CommonResponse<object> result = await _authService.LoginUser(loginRequest);
            if (!result.Success)
            {
                return Ok(new CommonResponse<object> { Success = false, Message = result.Message, Data = null, Errors = result.Errors, TimeStamp = result.TimeStamp });
                //return Ok(new APIResponse { Status = 400, Message = result.Message, Data=Errors });
            }
            else
            {
                return Ok(new CommonResponse<object> { Success = true, Message = result.Message, Data = result.Data, Errors = null, TimeStamp = result.TimeStamp });
            }
        }

        [AllowAnonymous]
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestModel verifyOtpRequest)
        {
            CommonResponse<object> result = await _authService.VerifyUserOtpAsync(verifyOtpRequest);
            if (!result.Success)
            {
                return Ok(new CommonResponse<object> { Success = false, Message = result.Message, Data = null, Errors = result.Errors, TimeStamp = result.TimeStamp });
                //return Ok(new APIResponse { Status = 400, Message = result.Message, Data=Errors });
            }
            else
            {
                return Ok(new CommonResponse<object> { Success = true, Message = result.Message, Data = result.Data, Errors = null, TimeStamp = result.TimeStamp });
            }
        }

        [AllowAnonymous]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenModel refreshTokenModel)
        {
            var result = await _authService.RefreshAccessTokenAsync(refreshTokenModel.RefreshToken);

            if (!result.Success)
            {
                return Ok(new CommonResponse<object>
                {
                    Success = false,
                    Message = result.Message,
                    Errors = result.Errors,
                    Data = null,
                    TimeStamp = result.TimeStamp
                });
            }

            return Ok(new CommonResponse<object> { Success = true, Message = result.Message, Data = result.Data, Errors = null, TimeStamp = result.TimeStamp });
        }



        //[HttpGet("roles")]
        //public async Task<IActionResult> GetRoles()
        //{
        //    // get all the roles
        //}

        [AllowAnonymous]
        [HttpGet("approve-user-by-approval-token")]
        public async Task<IActionResult> ApproveUserByApprovalToken([FromQuery] string approvalToken)
        {
            var result = await _authService.ApproveUserByApprovalTokenAsync(approvalToken);
            if (!result.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = result.Message });
            }
            else
            {
                return Ok(new APIResponse { Status = 200, Message = result.Message, Data = result.Data });
            }
        }

        [AllowAnonymous]
        [HttpGet("reject-user-by-rejection-token")]
        public async Task<IActionResult> RejectUserByApprovalToken([FromQuery] string rejectionToken)
        {
            var result = await _authService.RejectUserByRejectionTokenAsync(rejectionToken);
            if (!result.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = result.Message });
            }
            else
            {
                return Ok(new APIResponse { Status = 200, Message = result.Message, Data = result.Data });
            }
        }


        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new CommonResponse<object> { Success = false, Message = "Token is Invalid or Forbidden. Cannot find User Id", Data = null, Errors = new List<string>{"Invalid Token"}, TimeStamp = DateTime.UtcNow });
            }

            var result = await _authService.GetUserProfileInfo(userGuid);
            if (!result.Success)
            {
                return Ok(new CommonResponse<object> { Success = false, Message = result.Message, Data = null, Errors = result.Errors, TimeStamp = result.TimeStamp });
            }
            else
            {
                return Ok(new CommonResponse<object> { Success = true, Message = result.Message, Data = result.Data, Errors = null, TimeStamp = result.TimeStamp });
            }
        }

        // TODO: Make admin dashboard api here to Get admin dashboard statistics -> GET /api/admin/dashboard
        // TODO: Make pending seller api to Get all pending seller approval requests -> GET /api/admin/sellers/pending
        // TODO: modify the api endpoint for approve-user-by-approval-token and reject-user-by-rejection-token
    }
}
