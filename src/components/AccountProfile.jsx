import { client } from "@/lib/auth-client/vanilla";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { BadgeAlertIcon, BadgeCheckIcon, ShieldUserIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Label } from "./ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export default function AccountProfile({ initialAuthSession }) {
  const [authSession, setAuthSession] = useState(initialAuthSession);
  const [emailOTPState, setEmailOTPState] = useState("none");
  const [otp, setOtp] = useState("");
  const [emailVerificationState, setEmailVerificationState] = useState("none");

  useEffect(() => {
    const unsubscribe = client.useSession.subscribe(({ data, isPending }) => {
      if (!isPending) {
        setAuthSession(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const sendEmailOTP = () => {
    if (!authSession) return;

    setEmailOTPState("sending");
    setEmailVerificationState("none");

    client.emailOtp
      .sendVerificationOtp({
        email: authSession.user.email,
        type: "email-verification",
      })
      .then(({ data, error }) => {
        if (data?.success) {
          setEmailOTPState("sent");

          toast.success(<b>Verification email is sent</b>, {
            description: `An email with OTP is sent to ${authSession.user.email}`,
          });
        } else {
          setEmailOTPState("failed");

          if (error) {
            toast.error(error.message);
          }
        }
      })
      .catch(() => {
        setEmailOTPState("failed");
      });
  };

  const onOTPComplete = (otp) => {
    if (!authSession) return;

    setEmailVerificationState("verifying");

    client.emailOtp
      .verifyEmail({
        email: authSession.user.email,
        otp,
      })
      .then(async ({ data, error }) => {
        if (data?.status) {
          setEmailVerificationState("verified");

          toast.success("Your email is now verified");

          setAuthSession((await client.getSession()).data);
        } else {
          setEmailVerificationState("failed");

          if (error) {
            toast.error(error.message);
          }
        }
      })
      .catch(() => {
        setEmailVerificationState("failed");
      });
  };

  return authSession ? (
    <div className="flex flex-col gap-5">
      <div className="border p-3 rounded-md flex items-center gap-3">
        <Avatar className="border size-15 rounded-md">
          {authSession.user.image && (
            <AvatarImage
              className="rounded-md"
              src={authSession.user.image}
              alt={authSession.user.name}
            />
          )}
          <AvatarFallback className="rounded-md text-xl">
            {authSession.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <div className="font-medium">{authSession.user.name}</div>
          <div className="flex items-center gap-1.5 opacity-85 overflow-hidden">
            <span className="text-sm truncate">{authSession.user.email}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                {authSession.user.emailVerified ? (
                  <BadgeCheckIcon className="shrink-0" size={16} />
                ) : (
                  <BadgeAlertIcon className="shrink-0" size={16} />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {authSession.user.emailVerified
                    ? "Email is verified"
                    : "Email is not verified"}
                </p>
              </TooltipContent>
            </Tooltip>
            {authSession.user.role === "admin" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ShieldUserIcon className="shrink-0" size={16} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>You are an admin</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
      {!authSession.user.emailVerified && (
        <div className="border p-3 rounded-md flex flex-col gap-3">
          {emailVerificationState === "verified" ? (
            <>Your email is verified</>
          ) : emailOTPState === "sent" ? (
            <div className="flex flex-col gap-2">
              <Label>One-Time Password</Label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  if (value.length === 6) {
                    onOTPComplete(value);
                  }
                }}
                pattern={REGEXP_ONLY_DIGITS}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <div className="text-sm opacity-85">
                Please enter the one-time password sent to your email.
              </div>
            </div>
          ) : (
            <>
              <p className="leading-normal">
                Your email is not verified, click on Sent OTP to verify.
              </p>
              <Button
                className="w-fit"
                onClick={sendEmailOTP}
                disabled={
                  emailOTPState === "sending" || emailOTPState === "sent"
                }
              >
                {emailOTPState === "sending" ? "Sending" : "Send OTP"}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  ) : (
    <div>
      You are not logged in,{" "}
      <a href="/login" className="underline">
        login
      </a>{" "}
      to view your profile.
    </div>
  );
}
