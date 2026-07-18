from datetime import datetime


def build_response(domain, risk, analysis):

    return {

        "scan_info": {
            "domain": domain,
            "scan_time": datetime.utcnow().isoformat() + "Z",
            "engine": "Domain Verdict",
            "version": "2.0.0"
        },

        "summary": {
            "overall_score": risk["score"],
            "verdict": risk["verdict"],
            "trust_level": risk["trust_level"],
            "confidence": risk["confidence"],
            "scan_coverage": {
                "completed_sources": risk["completed_sources"],
                "total_sources": risk["total_sources"]
            },
            "category_scores": risk["category_scores"]
        },

        "analysis": analysis,

        "issues": risk["issues"]
    }
