using DataAccessLayer.Interfaces;
using ECommerceWebApi.Services.EmailService;
using ECommerceWebApi.Services.TokenService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.Ocsp;
using SharedReference;
using SharedReference.Entities;
//using System.Data;

namespace ECommerceWebApi.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly ISellerRepository _sellerRepository;
        private readonly IUserApprovalRequestRepository _userApprovalRequestRepository;
        private readonly JwtTokenService _jwtTokenService;
        private readonly EmailService.EmailService _emailService;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IConfiguration _configuration;
        private readonly IUserOtpRepository _userOtpRepository;

        public AuthService(IUserRepository userRepository, IRoleRepository roleRepository, ISellerRepository sellerRepository, IUserApprovalRequestRepository userApprovalRequestRepository, JwtTokenService jwtTokenService, EmailService.EmailService emailService, IRefreshTokenRepository refreshTokenRepository, IConfiguration configuration, IUserOtpRepository userOtpRepository)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _sellerRepository = sellerRepository;
            _userApprovalRequestRepository = userApprovalRequestRepository;
            _jwtTokenService = jwtTokenService;
            _emailService = emailService;
            _refreshTokenRepository = refreshTokenRepository;
            _configuration = configuration;
            _userOtpRepository = userOtpRepository;
        }

        private string GenerateOtpCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString(); // returns a 6-digit string
        }

        private string GenerateBody(string otpCode, string userName)
        {
            return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Your Security Code</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            line-height: 1.6;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-top: 40px;
            margin-bottom: 40px;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }}
        .header p {{
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }}
        .content {{
            padding: 40px 30px;
            text-align: center;
        }}
        .greeting {{
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 25px;
        }}
        .message {{
            font-size: 16px;
            color: #5a6c7d;
            margin-bottom: 30px;
            line-height: 1.7;
        }}
        .otp-container {{
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            box-shadow: 0 5px 15px rgba(240, 147, 251, 0.3);
        }}
        .otp-label {{
            color: white;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .otp-code {{
            font-size: 36px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }}
        .warning {{
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            color: #856404;
        }}
        .warning-icon {{
            font-size: 20px;
            margin-right: 8px;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }}
        .footer p {{
            margin: 0;
            color: #6c757d;
            font-size: 14px;
        }}
        .security-tips {{
            background-color: #e8f4fd;
            border-left: 4px solid #0066cc;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }}
        .security-tips h3 {{
            margin: 0 0 10px 0;
            color: #0066cc;
            font-size: 16px;
        }}
        .security-tips ul {{
            margin: 0;
            padding-left: 20px;
            color: #2c5282;
        }}
        .security-tips li {{
            margin-bottom: 5px;
            font-size: 14px;
        }}
        @media (max-width: 600px) {{
            .container {{
                margin: 10px;
                border-radius: 8px;
            }}
            .header, .content, .footer {{
                padding: 25px 20px;
            }}
            .otp-code {{
                font-size: 28px;
                letter-spacing: 4px;
            }}
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔐 Security Verification</h1>
            <p>Your account security is our priority</p>
        </div>
        
        <div class='content'>
            <div class='greeting'>
                Hello {(string.IsNullOrEmpty(userName) ? "there" : userName)},
            </div>
            
            <div class='message'>
                We received a request to sign in to your account. To complete your login, please use the verification code below:
            </div>
            
            <div class='otp-container'>
                <div class='otp-label'>Your Verification Code</div>
                <div class='otp-code'>{otpCode}</div>
            </div>
            
            <div class='warning'>
                <span class='warning-icon'>⚠️</span>
                <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>. Please use it immediately to complete your login.
            </div>
            
            <div class='security-tips'>
                <h3>🛡️ Security Tips</h3>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>We will never ask for this code via phone or email</li>
                    <li>If you didn't request this code, please ignore this email</li>
                </ul>
            </div>
        </div>
        
        <div class='footer'>
            <p>
                This is an automated message. Please do not reply to this email.<br>
                If you're having trouble, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>";
        }

        public async Task<IActionResult> LoginUser(LoginRequestModel loginRequest)
        {
            // first validate that all the fields are present, after that check that user exists or not, if exists then generate bearerToken and refreshToken and send back that data to the authController

            // Step 1: Validate input
            if (string.IsNullOrEmpty(loginRequest.Email) || string.IsNullOrEmpty(loginRequest.Password))
            {
                return Ok(new APIResponse { Status = 400, Message = "Email and Password are required" });

                //return CommonResponse<object>.FailureResponse(
                //    new List<string> { "Email and Password are required." },
                //    "Invalid login request"
                //);
            }

            // Step 2: Check if user exists
            var userResult = await _userRepository.GetUserByEmailAsync(loginRequest.Email);
            if (!userResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid email or password" });

                //return CommonResponse<object>.FailureResponse(
                //    new List<string> { "Invalid email or password." },
                //    "Authentication failed"
                //);

            }


            // Step 3: Check password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginRequest.Password, userResult.Data.PasswordHash);
            if (!isPasswordValid)
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid email or password" });

                //return CommonResponse<object>.FailureResponse(
                //    new List<string> { "Invalid email or password." },
                //    "Authentication failed"
                //);
            }

            // check that user is approved and isActive
            // Step 4: Check if user's customer profile and seller is approved and active
            if (userResult.Data.CustomerProfile != null && !userResult.Data.CustomerProfile.IsActive)
            {
                return CommonResponse<object>.FailureResponse(
                    new List<string> { "Your customer profile is inactive. Please contact support." },
                    "Customer profile inactive"
                );
            }

            if (userResult.Data.SellerProfile != null)
            {
                if (!userResult.Data.SellerProfile.IsApproved)
                {
                    return Ok(new APIResponse { Status = 400, Message = "Your seller account is awaiting admin approval" });

                    //return CommonResponse<object>.FailureResponse(
                    //    new List<string> { "Your seller account is awaiting admin approval." },
                    //    "Seller not approved"
                    //);
                }

                if (!userResult.Data.SellerProfile.IsActive)
                {
                    return Ok(new APIResponse { Status = 400, Message = "Your seller account is inactive" });

                    //return CommonResponse<object>.FailureResponse(
                    //    new List<string> { "Your seller account is inactive." },
                    //    "Seller profile inactive"
                    //);
                }
            }


            // Step 5: Check if 2FA is enabled
            if (userResult.Data.Is2FAEnabled)
            {
                // Clear old OTPs
                await _userOtpRepository.DeleteAllOtpsByUserIdAsync(userResult.Data.Id);

                // Generate new OTP
                string otpCode = GenerateOtpCode();

                // Save OTP to DB
                var otpModel = new UserOTPModel
                {
                    UserId = userResult.Data.Id,
                    OtpCode = otpCode,
                    ExpiryTime = DateTime.UtcNow.AddMinutes(10),
                    AttemptCount = 0
                };

                await _userOtpRepository.SaveOtpAsync(otpModel);

                // Send OTP via email
                await _emailService.SendEmailAsync(userResult.Data.Email, "2FA Requests OTP For Login", GenerateBody(otpCode, userResult.Data.FullName));

                var twoFAResposneData = new
                {
                    Status = "2FA_REQUIRED",
                    Message = "Two-factor authentication is enabled. Please verify using the OTP sent to your email.",
                    UserId = userResult.Data.Id
                };

                return Ok(new APIResponse { Status = 302, Message = "2FA required", Data = twoFAResposneData });

                // Return 2FA-required response
                //return CommonResponse<object>.SuccessResponse(
                //    new
                //    {
                //        Status = "2FA_REQUIRED",
                //        Message = "Two-factor authentication is enabled. Please verify using the OTP sent to your email.",
                //        UserId = userResult.Data.Id
                //    },
                //    "2FA required"
                //);

            }

            // Step 5: Generate token
            var jwtToken = _jwtTokenService.GenerateJwtToken(userResult.Data);
            var refreshToken = _jwtTokenService.GenerateRefreshToken();

            // Step 6: Get all existing refresh tokens by userId
            var existingRefreshTokens = await _refreshTokenRepository.GetRefreshTokensByUserIdAsync(userResult.Data.Id);

            // Step 7: Revoke old tokens
            foreach (var token in existingRefreshTokens.Where(t => !t.IsRevoked))
            {
                token.IsRevoked = true;
                //token.ExpiresAt = DateTime.UtcNow; // Optional: expire immediately
                await _refreshTokenRepository.UpdateRefreshTokenAsync(token);
            }

            // Step 8: Save the refreh token in the database
            await _refreshTokenRepository.SaveRefreshTokenAsync(new RefreshTokenModel
            {
                RefreshToken = refreshToken,
                UserId = userResult.Data.Id,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["Jwt:RefreshTokenExpireDays"]))
            });

            // Step 9: Get roles from UserRoles
            var roles = userResult.Data.Roles?.Select(ur => ur.Role?.Name)?.ToList() ?? new List<string>();

            // Step 10: Update last login timestamp
            userResult.Data.LastLogin = DateTime.UtcNow;
            await _userRepository.UpdateUserInDBAsync(userResult.Data);

            // Step 11: Return success response
            var responseData = new
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                User = new
                {
                    UserId = userResult.Data.Id,
                    FullName = userResult.Data.FullName,
                    Email = userResult.Data.Email,
                    Roles = roles,

                    IsCustomer = userResult.Data.CustomerProfile != null,
                    CustomerId = userResult.Data.CustomerProfile?.Id,

                    IsSeller = userResult.Data.SellerProfile != null,
                    SellerId = userResult.Data.SellerProfile?.Id,
                    StoreName = userResult.Data.SellerProfile?.StoreName,
                    City = userResult.Data.SellerProfile?.City,

                    IsAdmin = roles.Contains("Admin"),

                    LastLogin = userResult.Data.LastLogin
                }
            };

            return Ok(new APIResponse { Status = 200, Message = "User logged in successfully", Data = responseData });

            //// Step 11: Return success response
            //return CommonResponse<object>.SuccessResponse(
            //    new
            //    {
            //        Token = jwtToken,
            //        RefreshToken = refreshToken,
            //        User = new
            //        {
            //            UserId = userResult.Data.Id,
            //            FullName = userResult.Data.FullName,
            //            Email = userResult.Data.Email,
            //            Roles = roles,

            //            IsCustomer = userResult.Data.CustomerProfile != null,
            //            CustomerId = userResult.Data.CustomerProfile?.Id,

            //            IsSeller = userResult.Data.SellerProfile != null,
            //            SellerId = userResult.Data.SellerProfile?.Id,
            //            StoreName = userResult.Data.SellerProfile?.StoreName,
            //            City = userResult.Data.SellerProfile?.City,

            //            IsAdmin = roles.Contains("Admin"),

            //            LastLogin = userResult.Data.LastLogin
            //        }
            //    },
            //    "User logged in successfully"
            //);
        }

        public async Task<IActionResult> VerifyUserOtpAsync(VerifyOtpRequestModel userOtpRequestModel)
        {
            // Step 1: Validate user
            var user = await _userRepository.GetUserByIdAsync(userOtpRequestModel.UserId);
            if (user == null)
            {
                return CommonResponse<object>.FailureResponse(
                    new List<string> { "User not found." },
                    "Invalid OTP verification request"
                );
            }

            // Step 2: Fetch latest valid OTP
            var userOtp = await _userOtpRepository.GetLatestValidOtpByUserIdAsync(user.Id);
            if (userOtp == null || userOtp.ExpiryTime < DateTime.UtcNow)
            {
                return CommonResponse<object>.FailureResponse(
                   new List<string> { "OTP is expired or not found." },
                   "Invalid or expired OTP"
               );
            }

            // Step 3: Check maximum OTP attempts
            // TODO: Implement this funcionality later
            //if (userOtp.AttemptCount >= 5)
            //{
            //    return CommonResponse<object>.FailureResponse(
            //        new List<string> { "Too many incorrect OTP attempts. Please try again later." },
            //        "OTP locked"
            //    );
            //}

            // Step 4: Validate OTP
            if (userOtp.OtpCode != userOtpRequestModel.OtpCode)
            {
                await _userOtpRepository.IncrementAttemptAsync(user.Id); // central handling
                return CommonResponse<object>.FailureResponse(
                    new List<string> { "Incorrect OTP." },
                    "Invalid OTP"
                );
            }

            // Step 5: OTP is correct — clean up OTPs
            await _userOtpRepository.DeleteAllOtpsByUserIdAsync(user.Id);

            // Step 6: Generate JWT & Refresh Token
            var jwtToken = _jwtTokenService.GenerateJwtToken(user);
            var refreshToken = _jwtTokenService.GenerateRefreshToken();

            // Step 7: Revoke old refresh tokens
            var existingRefreshTokens = await _refreshTokenRepository.GetRefreshTokensByUserIdAsync(user.Id);
            foreach (var token in existingRefreshTokens.Where(t => !t.IsRevoked))
            {
                token.IsRevoked = true;
                await _refreshTokenRepository.UpdateRefreshTokenAsync(token);
            }

            // Step 8: Save new refresh token
            await _refreshTokenRepository.SaveRefreshTokenAsync(new RefreshTokenModel
            {
                RefreshToken = refreshToken,
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["Jwt:RefreshTokenExpireDays"]))
            });

            // Step 9: Update last login time
            user.LastLogin = DateTime.UtcNow;
            await _userRepository.UpdateUserInDBAsync(user);

            // Step 10: Prepare roles and return response
            var roles = user.Roles?.Select(r => r.Role?.Name)?.ToList() ?? new List<string>();

            return CommonResponse<object>.SuccessResponse(
                new
                {
                    Token = jwtToken,
                    RefreshToken = refreshToken,
                    User = new
                    {
                        UserId = user.Id,
                        FullName = user.FullName,
                        Email = user.Email,
                        Roles = roles,

                        IsCustomer = user.CustomerProfile != null,
                        CustomerId = user.CustomerProfile?.Id,

                        IsSeller = user.SellerProfile != null,
                        SellerId = user.SellerProfile?.Id,
                        StoreName = user.SellerProfile?.StoreName,
                        City = user.SellerProfile?.City,

                        IsAdmin = roles.Contains("Admin"),
                        LastLogin = user.LastLogin
                    }
                },
                "OTP verified and user logged in successfully"
            );
        }


        public async Task<CommonResponse<object>> RegisterUser(RegisterRequestModel registerRequest)
        {
            // validate the register data, then check that user exists with same email or not, then send email to the admin, but if it is admin then dont send email instead approve it

            // Step-1: Validations
            if (string.IsNullOrEmpty(registerRequest.Email) ||
                string.IsNullOrEmpty(registerRequest.Password) ||
                string.IsNullOrEmpty(registerRequest.FullName) ||
                registerRequest.Roles == null || !registerRequest.Roles.Any())
            {
                return CommonResponse<object>.FailureResponse(new List<string> { "Email, Password, FullName, and at least one Role are required" }, "Required fields are missing");
            }

            // Step 2: Validate roles
            var validRoles = new[] { "Customer", "Seller", "Admin" };
            if (registerRequest.Roles.Any(r => !validRoles.Contains(r)))
            {
                return CommonResponse<object>.FailureResponse(new List<string> { "Only 'Customer', 'Seller', or 'Admin' are allowed" }, "Invalid role(s) specified");
            }

            // Step 3: Check if user exists
            var existingUser = await _userRepository.GetUserByEmailAsync(registerRequest.Email);
            if (existingUser != null)
            {
                return CommonResponse<object>.FailureResponse(new List<string> { "Duplicate email" }, "User already exists");
            }

            // Step 4: Hash password (replace with real hashing)
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password);

            var newUserId = Guid.NewGuid();
            var rolesFromDb = await _roleRepository.GetRolesByNamesAsync(registerRequest.Roles);

            if (rolesFromDb == null || rolesFromDb.Count == 0)
            {
                return CommonResponse<object>.FailureResponse(new List<string> { $"Invalid Roles: {string.Join(", ", registerRequest.Roles)}" }, "Invalid Role(s)");
            }

            // Step 5: Create new user
            var newUser = new User
            {
                Id = newUserId,
                Email = registerRequest.Email,
                PasswordHash = hashedPassword,
                FullName = registerRequest.FullName,
                CreatedAt = DateTime.UtcNow,
                Roles = rolesFromDb.Select(role => new UserRole
                {
                    UserId = newUserId,
                    RoleId = role.Id,
                    CreatedAt = DateTime.UtcNow
                }).ToList()
            };

            // Step 6: Add profiles based on roles
            if (registerRequest.Roles.Contains("Customer"))
            {
                var customerId = Guid.NewGuid();

                newUser.CustomerProfile = new Customer
                {
                    Id = Guid.NewGuid(),
                    UserId = newUser.Id,
                    IsActive = true,
                    Wallet = new Wallet
                    {
                        Id = Guid.NewGuid(),
                        CustomerId = customerId,
                        Balance = 0,
                        LastUpdated = DateTime.UtcNow
                    },
                    Cart = new Cart
                    {
                        Id = Guid.NewGuid(),
                        CustomerId = customerId,
                        UpdatedAt = DateTime.UtcNow
                    }
                };
            }

            if (registerRequest.Roles.Contains("Seller"))
            {
                newUser.SellerProfile = new Seller
                {
                    Id = Guid.NewGuid(),
                    UserId = newUser.Id,
                    StoreName = registerRequest.StoreName,
                    City = registerRequest.City,
                    IsApproved = false,
                    IsActive = false,
                    CreatedAt = DateTime.UtcNow
                };
            }

            // Step 7: Save user to DB
            var isCreated = await _userRepository.CreateUserInDBAsync(newUser);
            if (!isCreated)
            {
                return CommonResponse<object>.FailureResponse(new List<string> { "User could not be saved to the database." }, "User Registration failed");
            }

            // Step 8: Create UserApprovalRequest (for non-admins)
            if (!registerRequest.Roles.Contains("Admin") && newUser.SellerProfile != null)
            {
                var userApprovalRequest = new UserApprovalRequest
                {
                    Id = Guid.NewGuid(),
                    UserId = newUser.Id,
                    RequestedRole = string.Join(", ", registerRequest.Roles),
                    City = registerRequest.City ?? "",
                    Status = UserApprovalStatus.Pending
                };

                var approvalRequestCreated = await _userApprovalRequestRepository.CreateUserApprovalRequestAsync(userApprovalRequest);
                if (!approvalRequestCreated)
                {
                    return CommonResponse<object>.FailureResponse(
                        new List<string> { "UserApprovalRequest could not be saved." },
                        "Approval request creation failed");
                }
            }




            // Step 9: Notify Admin (optional for non-admins)
            if (!registerRequest.Roles.Contains("Admin") && newUser.SellerProfile != null)
            {
                // fetch the admin email and pass it to email serivce
                var adminUsers = await _userRepository.GetUsersByRoleAsync("Admin");
                var adminEmails = adminUsers?.Select(userObj => userObj.Email).ToList() ?? new List<string>();

                var approvalToken = _jwtTokenService.GenerateApprovalToken(newUser.Id);
                var rejectionToken = _jwtTokenService.GenerateRejectionToken(newUser.Id);

                foreach (var adminEmail in adminEmails)
                {
                    await _emailService.SendApprovalRequestToAdminAsync(newUser, adminEmail, approvalToken, rejectionToken);
                }
            }

            // Prepare profile info
            object profileInfo = null;

            bool hasCustomer = newUser.CustomerProfile != null;
            bool hasSeller = newUser.SellerProfile != null;

            if (hasCustomer && hasSeller)
            {
                profileInfo = new
                {
                    CustomerProfileActive = newUser.CustomerProfile.IsActive,
                    SellerProfileApproved = newUser.SellerProfile.IsApproved,
                    SellerProfileActive = newUser.SellerProfile.IsActive
                };
            }
            else if (hasCustomer)
            {
                profileInfo = new
                {
                    CustomerProfileActive = newUser.CustomerProfile.IsActive
                };
            }
            else if (hasSeller)
            {
                profileInfo = new
                {
                    SellerProfileApproved = newUser.SellerProfile.IsApproved,
                    SellerProfileActive = newUser.SellerProfile.IsActive
                };
            }


            return CommonResponse<object>.SuccessResponse(
                new
                {
                    UserId = newUser.Id,
                    Email = newUser.Email,
                    Roles = registerRequest.Roles,
                    Profile = profileInfo
                }, "User registered successfully. Awaiting approval.");
        }

        public async Task<CommonResponse<object>> RefreshAccessTokenAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return CommonResponse<object>.FailureResponse(
                    new List<string> { "Refresh token is required." },
                    "Invalid request"
                );
            }

            var token = await _refreshTokenRepository.GetRefreshTokenByTokenAsync(refreshToken);

            if (token == null || token.IsRevoked || token.ExpiresAt < DateTime.UtcNow)
            {
                return CommonResponse<object>.FailureResponse(
                    new List<string> { "Invalid or expired refresh token." },
                    "Token validation failed"
                );
            }

            // Revoke the current token
            token.IsRevoked = true;
            await _refreshTokenRepository.UpdateRefreshTokenAsync(token);

            // Generate new tokens
            var newAccessToken = _jwtTokenService.GenerateJwtToken(token.User);
            var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

            // Save new refresh token
            await _refreshTokenRepository.SaveRefreshTokenAsync(new RefreshTokenModel
            {
                RefreshToken = newRefreshToken,
                UserId = token.UserId,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["Jwt:RefreshTokenExpireDays"]))
            });

            return CommonResponse<object>.SuccessResponse(
                new
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken
                },
                "Token refreshed successfully"
            );
        }


        public async Task<IActionResult> ApproveUserByApprovalTokenAsync(string approvalToken)
        {
            object responseData;
            var principal = _jwtTokenService.ValidateApprovalToken(approvalToken);
            if (principal == null)
            {
                return Ok(new APIResponse { Status = 401, Message = "Invalid or expired token" });
                //return CommonResponse<object>.FailureResponse(new List<string> { "Invalid or expired token" }, "Invalid or expired token");
            }

            var userId = Guid.Parse(principal.FindFirst("userId")?.Value);
            var userResult = await _userRepository.GetUserByIdAsync(userId);

            if (!userResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = userResult.Message });
            }

            if (userResult.Data.SellerProfile.IsApproved)
            {
                return Ok(new APIResponse { Status = 400, Message = "User already approved." });
                //return CommonResponse<object>.FailureResponse(new List<string> { "User not found or already approved" }, "User not found or already approved");
            }



            //user.SellerProfile.IsApproved = true;
            //user.SellerProfile.IsActive = true;

            //await _userRepository.UpdateUserInDBAsync(user);

            var isApproved = await _sellerRepository.ApproveSellerBySellerIdAsync(userResult.Data.SellerProfile.Id);

            if (!isApproved)
            {
                responseData = new
                {
                    FullName = userResult.Data.FullName,
                    Email = userResult.Data.Email,
                    SellerProfileApproved = userResult.Data.SellerProfile.IsApproved
                };
                return Ok(new APIResponse { Status = 400, Message = "Something Went Wrong While approving User", Data = responseData });

                //return CommonResponse<object>.SuccessResponse(new
                //{
                //    FullName = user.FullName,
                //    Email = user.Email,
                //    SellerProfileApproved = user.SellerProfile.IsApproved
                //}, "Something Went Wrong While approving User");
            }

            responseData = new { FullName = userResult.Data.FullName, Email = userResult.Data.Email, SellerProfileApproved = userResult.Data.SellerProfile.IsApproved };

            return Ok(new APIResponse { Status = 200, Message = "User approved successfully", Data = responseData });
            //return CommonResponse<object>.SuccessResponse(new { FullName = user.FullName, Email = user.Email, SellerProfileApproved = user.SellerProfile.IsApproved }, "User approved successfully");

        }

        public async Task<CommonResponse<object>> RejectUserByRejectionTokenAsync(string rejectionToken)
        {
            var principal = _jwtTokenService.ValidateRejectionToken(rejectionToken);
            if (principal == null)
            {
                return CommonResponse<object>.FailureResponse(new List<string> { "Invalid or expired token" }, "Invalid or expired token");
            }

            var userId = Guid.Parse(principal.FindFirst("userId")?.Value);
            var user = await _userRepository.GetUserByIdAsync(userId);

            if (user == null || user.SellerProfile == null || user.SellerProfile.IsApproved)
            {
                return CommonResponse<object>.FailureResponse(new List<string> { "User not found or already processed" }, "User not found or already processed");
            }

            //if (user.CustomerProfile != null)
            //{
            //    // User is also a customer — just remove seller profile
            //    await _userRepository.DeleteSellerProfileAsync(user.SellerProfile.Id);
            //}
            //else
            //{
            //    // User is only a seller — safe to delete the entire user
            //    await _userRepository.DeleteUserAsync(user.Id);
            //}

            var isRejected = await _sellerRepository.RejectSellerBySellerIdAsync(user.SellerProfile.Id);

            if (!isRejected)
            {
                return CommonResponse<object>.SuccessResponse(new { FullName = user.FullName, Email = user.Email, IsApproved = user.SellerProfile.IsApproved }, "Something went wrong while rejecting user");
            }

            return CommonResponse<object>.SuccessResponse(new { FullName = user.FullName, Email = user.Email, IsApproved = user.SellerProfile.IsApproved }, "User rejected successfully");
        }


        public async Task<CommonResponse<object>> GetUserProfileInfo(Guid userId)
        {
            var userData = await _userRepository.GetUserByIdAsync(userId);

            if (userData == null)
            {
                return CommonResponse<object>.FailureResponse(
                        new List<string> { "User data not found" },
                        "User data not found. Possible reasons, user is not registered"
                    );
            }

            var roles = userData.Roles?.Select(ur => ur.Role?.Name)?.ToList() ?? new List<string>();

            return CommonResponse<object>.SuccessResponse(
                new
                {
                    UserId = userData.Id,
                    FullName = userData.FullName,
                    Email = userData.Email,
                    Roles = roles,

                    IsCustomer = userData.CustomerProfile != null,
                    CustomerId = userData.CustomerProfile?.Id,

                    IsSeller = userData.SellerProfile != null,
                    SellerId = userData.SellerProfile?.Id,
                    StoreName = userData.SellerProfile?.StoreName,
                    City = userData.SellerProfile?.City,

                    IsAdmin = roles.Contains("Admin"),

                    LastLogin = userData.LastLogin

                },
                "User profile fetched successfully"
            );
        }

    }
}
